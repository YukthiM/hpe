const express = require('express');
const router = express.Router();
const { submitReview, getWorkerReviews } = require('../controllers/reviewController');

// Public route — no auth required (QR scan from client's phone)
router.post('/:qrToken', submitReview);
router.get('/worker/:workerId', getWorkerReviews);

module.exports = router;
