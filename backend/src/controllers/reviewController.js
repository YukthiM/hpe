const Review = require('../models/Review');
const Job = require('../models/Job');
const { updateUserReputation } = require('../utils/reputationScore');
const User = require('../models/User');

// POST /api/reviews/:qrToken — Submit a verified review
const submitReview = async (req, res) => {
  try {
    const { qrToken } = req.params;
    const { rating, comment, reviewerName, reviewerEmail, tags } = req.body;

    // Find the job by QR token
    const job = await Job.findOne({ qrToken });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Invalid or expired QR code' });
    }

    if (job.qrUsed) {
      return res.status(400).json({
        success: false,
        message: 'This review link has already been used. Each QR code allows only one review.',
      });
    }

    // Duplicate review detection — check for same IP + same worker (fraud)
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const existingFromSameIP = await Review.findOne({
      workerId: job.workerId,
      ipAddress: clientIp,
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // within 24h
    });

    const review = new Review({
      jobId: job._id,
      workerId: job.workerId,
      qrToken,
      reviewerName,
      reviewerEmail,
      rating: parseInt(rating),
      comment,
      tags: tags || [],
      ipAddress: clientIp,
      isFlagged: !!existingFromSameIP, // Flag duplicate
      flagReason: existingFromSameIP ? 'Duplicate IP within 24 hours' : undefined,
    });

    await review.save();

    // Mark job as reviewed
    job.qrUsed = true;
    job.qrUsedAt = new Date();
    job.status = 'reviewed';
    job.reviewId = review._id;
    job.reviewedAt = new Date();
    await job.save();

    // Update reputation score
    const reputation = await updateUserReputation(User, Review, job.workerId);

    res.status(201).json({
      success: true,
      review,
      reputation,
      message: existingFromSameIP
        ? 'Review submitted but flagged for manual review due to duplicate detection.'
        : 'Thank you! Your verified review has been submitted.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reviews/worker/:workerId — Get all reviews for a worker
const getWorkerReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ workerId: req.params.workerId, isFlagged: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ workerId: req.params.workerId, isFlagged: false });

    res.json({
      success: true,
      reviews,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { submitReview, getWorkerReviews };
