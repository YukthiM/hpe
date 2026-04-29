const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Review = require('../models/Review');
const Job = require('../models/Job');

// GET /api/workers — Search & Discovery
const getWorkers = async (req, res) => {
  try {
    const { skill, location, rating, page = 1, limit = 12, sort = 'reputationScore' } = req.query;

    const query = { role: 'worker' };

    if (skill) query.skills = { $regex: skill, $options: 'i' };
    if (location) query.location = { $regex: location, $options: 'i' };
    if (rating) query.averageRating = { $gte: parseFloat(rating) };

    const sortOptions = {
      reputationScore: { reputationScore: -1 },
      rating: { averageRating: -1 },
      jobs: { completedJobsCount: -1 },
    };

    const workers = await User.find(query)
      .select('-password -idDocumentUrl')
      .sort(sortOptions[sort] || { reputationScore: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      workers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/workers/:id
const getWorkerById = async (req, res) => {
  try {
    const worker = await User.findOne({
      $or: [{ _id: req.params.id }, { publicProfileSlug: req.params.id }],
      role: 'worker',
    }).select('-password -idDocumentUrl');

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const portfolio = await Portfolio.findOne({ workerId: worker._id });
    const reviews = await Review.find({ workerId: worker._id, isFlagged: false })
      .sort({ createdAt: -1 })
      .limit(10);

    const recentJobs = await Job.find({ workerId: worker._id, status: 'reviewed' })
      .sort({ completedAt: -1 })
      .limit(5)
      .select('title skill completedAt');

    res.json({
      success: true,
      worker,
      portfolio,
      reviews,
      recentJobs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/workers/:id/reputation — Export portable reputation
const getReputationExport = async (req, res) => {
  try {
    const worker = await User.findById(req.params.id).select('-password -idDocumentUrl');
    if (!worker || worker.role !== 'worker') {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const reviews = await Review.find({ workerId: worker._id, isFlagged: false });

    const exportData = {
      profile: {
        name: worker.name,
        skills: worker.skills,
        location: worker.location,
        publicProfile: `${process.env.CLIENT_URL}/profile/${worker.publicProfileSlug}`,
      },
      reputation: {
        score: worker.reputationScore,
        tier: worker.reputationTier,
        averageRating: worker.averageRating,
        totalReviews: worker.totalRatings,
        completedJobs: worker.completedJobsCount,
        idVerified: worker.idVerified,
        badges: worker.badges,
      },
      recentReviews: reviews.slice(0, 5).map((r) => ({
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt,
        integrityHash: r.integrityHash,
      })),
      generatedAt: new Date().toISOString(),
    };

    res.json({ success: true, data: exportData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/workers/skills/list — All unique skills
const getSkillsList = async (req, res) => {
  try {
    const skills = await User.distinct('skills', { role: 'worker' });
    res.json({ success: true, skills: skills.filter(Boolean) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getWorkers, getWorkerById, getReputationExport, getSkillsList };
