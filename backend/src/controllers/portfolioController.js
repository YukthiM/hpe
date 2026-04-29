const Portfolio = require('../models/Portfolio');
const { simulateIDVerification, mockApproveVerification } = require('../utils/idVerification');
const User = require('../models/User');

// GET /api/portfolio/me
const getMyPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ workerId: req.user._id });
    if (!portfolio) {
      portfolio = await Portfolio.create({ workerId: req.user._id });
    }
    res.json({ success: true, portfolio });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/portfolio/me — Update portfolio info
const updatePortfolio = async (req, res) => {
  try {
    const { about, serviceAreas, specializations, tools, socialLinks } = req.body;

    const portfolio = await Portfolio.findOneAndUpdate(
      { workerId: req.user._id },
      { about, serviceAreas, specializations, tools, socialLinks },
      { new: true, upsert: true }
    );

    res.json({ success: true, portfolio });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/portfolio/images — Upload work image
const addWorkImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const caption = req.body.caption || '';
    const imageUrl = `/uploads/${req.file.filename}`;

    const portfolio = await Portfolio.findOneAndUpdate(
      { workerId: req.user._id },
      { $push: { workImages: { url: imageUrl, caption } } },
      { new: true, upsert: true }
    );

    res.status(201).json({ success: true, portfolio, imageUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/portfolio/images/:imageId
const deleteWorkImage = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOneAndUpdate(
      { workerId: req.user._id },
      { $pull: { workImages: { _id: req.params.imageId } } },
      { new: true }
    );
    res.json({ success: true, portfolio });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/portfolio/certifications — Add certification
const addCertification = async (req, res) => {
  try {
    const { name, issuer, issueDate, expiryDate } = req.body;
    const documentUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const portfolio = await Portfolio.findOneAndUpdate(
      { workerId: req.user._id },
      { $push: { certifications: { name, issuer, issueDate, expiryDate, documentUrl } } },
      { new: true, upsert: true }
    );

    res.status(201).json({ success: true, portfolio });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/portfolio/verify-id — Submit ID for verification
const submitIDVerification = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload your ID document' });
    }

    const documentUrl = `/uploads/${req.file.filename}`;
    const result = await simulateIDVerification(documentUrl);

    await User.findByIdAndUpdate(req.user._id, {
      idDocumentUrl: documentUrl,
      idVerificationStatus: result.status,
    });

    // Simulate auto-approval after 2 seconds for demo purposes
    if (process.env.NODE_ENV === 'development') {
      setTimeout(async () => {
        await mockApproveVerification(User, req.user._id);
      }, 3000);
    }

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getMyPortfolio,
  updatePortfolio,
  addWorkImage,
  deleteWorkImage,
  addCertification,
  submitIDVerification,
};
