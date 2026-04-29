const express = require('express');
const router = express.Router();
const { getMyJobs, createJob, getJobById, verifyQRToken } = require('../controllers/jobController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', protect, requireRole('worker'), getMyJobs);
router.post('/', protect, requireRole('worker'), createJob);
router.get('/verify/:qrToken', verifyQRToken); // Public — used from QR scan
router.get('/:id', protect, getJobById);

module.exports = router;
