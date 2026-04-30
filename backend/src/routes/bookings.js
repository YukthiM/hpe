const express = require('express');
const router = express.Router();
const {
  createBooking,
  getClientBookings,
  getWorkerBookings,
  respondToBooking,
  startJob,
  markCompleted,
  payBooking,
  confirmPayment,
  submitBookingReview,
  getBookingById,
} = require('../controllers/bookingController');
const { protect, requireRole } = require('../middleware/auth');

// Client routes
router.post('/',          protect, requireRole('client'), createBooking);
router.get('/my',         protect, requireRole('client'), getClientBookings);
router.patch('/:id/complete', protect, requireRole('client'), markCompleted);
router.patch('/:id/pay',      protect, requireRole('client'), payBooking);
router.post('/:id/review',    protect, requireRole('client'), submitBookingReview);

// Worker routes
router.get('/worker',         protect, requireRole('worker'), getWorkerBookings);
router.patch('/:id/respond',  protect, requireRole('worker'), respondToBooking);
router.patch('/:id/start',    protect, requireRole('worker'), startJob);
router.patch('/:id/confirm',  protect, requireRole('worker'), confirmPayment);

// Shared (both roles can view)
router.get('/:id',        protect, getBookingById);

module.exports = router;
