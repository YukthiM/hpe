const Job = require('../models/Job');
const { generateQRCode } = require('../utils/qrGenerator');

// GET /api/jobs — Get worker's job history
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ workerId: req.user._id })
      .populate('reviewId', 'rating comment createdAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/jobs — Create a completed job + generate QR
const createJob = async (req, res) => {
  try {
    const { title, description, skill, location, amount, clientName, clientEmail } = req.body;

    const job = new Job({
      title,
      description,
      skill,
      location,
      amount,
      clientName,
      clientEmail,
      workerId: req.user._id,
      status: 'completed',
    });

    // Generate QR code pointing to review page
    const { dataUrl, reviewUrl } = await generateQRCode(job.qrToken);
    job.qrCodeDataUrl = dataUrl;

    await job.save();

    res.status(201).json({
      success: true,
      job,
      reviewUrl,
      message: 'Job created. Share the QR code with your client to collect a verified review.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/jobs/:id — Get job details (for QR display)
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('workerId', 'name avatar skills location reputationScore reputationTier')
      .populate('reviewId');

    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // Only allow worker to see full details (with QR), or anyone to see basic info
    const isOwner = req.user && req.user._id.toString() === job.workerId._id.toString();

    if (!isOwner) {
      const sanitized = { ...job.toObject() };
      delete sanitized.qrCodeDataUrl;
      return res.json({ success: true, job: sanitized });
    }

    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/jobs/verify/:qrToken — Verify QR token & get job info for review page
const verifyQRToken = async (req, res) => {
  try {
    const job = await Job.findOne({ qrToken: req.params.qrToken })
      .populate('workerId', 'name avatar skills location reputationScore reputationTier averageRating');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Invalid QR code' });
    }

    if (job.qrUsed) {
      return res.status(400).json({
        success: false,
        message: 'This review link has already been used.',
        alreadyReviewed: true,
        reviewId: job.reviewId,
      });
    }

    res.json({
      success: true,
      job: {
        id: job._id,
        title: job.title,
        skill: job.skill,
        completedAt: job.completedAt,
        worker: job.workerId,
        qrToken: job.qrToken,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMyJobs, createJob, getJobById, verifyQRToken };
