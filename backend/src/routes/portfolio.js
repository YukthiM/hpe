const express = require('express');
const router = express.Router();
const {
  getMyPortfolio,
  updatePortfolio,
  addWorkImage,
  deleteWorkImage,
  addCertification,
  submitIDVerification,
} = require('../controllers/portfolioController');
const { protect, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/me', protect, requireRole('worker'), getMyPortfolio);
router.put('/me', protect, requireRole('worker'), updatePortfolio);
router.post('/images', protect, requireRole('worker'), upload.single('image'), addWorkImage);
router.delete('/images/:imageId', protect, requireRole('worker'), deleteWorkImage);
router.post('/certifications', protect, requireRole('worker'), upload.single('document'), addCertification);
router.post('/verify-id', protect, requireRole('worker'), upload.single('document'), submitIDVerification);

module.exports = router;
