const Booking = require('../models/Booking');
const BookingReview = require('../models/BookingReview');
const User = require('../models/User');

// ─── 1. Client creates a booking ─────────────────────────────────────────────
const createBooking = async (req, res) => {
  try {
    const { workerId, clientAddress, clientPhone, serviceDate, notes } = req.body;

    if (!workerId || !clientAddress || !clientPhone) {
      return res.status(400).json({ success: false, message: 'workerId, clientAddress and clientPhone are required.' });
    }

    // Prevent booking yourself
    if (workerId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot book yourself.' });
    }

    // Check worker exists
    const worker = await User.findById(workerId);
    if (!worker || worker.role !== 'worker') {
      return res.status(404).json({ success: false, message: 'Worker not found.' });
    }

    // Prevent duplicate pending booking
    const existing = await Booking.findOne({
      clientId: req.user._id,
      workerId,
      status: { $in: ['pending', 'accepted', 'in_progress'] },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You already have an active booking with this worker.' });
    }

    const booking = await Booking.create({
      clientId: req.user._id,
      workerId,
      clientAddress,
      clientPhone,
      serviceDate: serviceDate || null,
      notes: notes || '',
      status: 'pending',
    });

    const populated = await Booking.findById(booking._id)
      .populate('workerId', 'name avatar skills location')
      .populate('clientId', 'name email phone');

    res.status(201).json({ success: true, booking: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 2. Client: get own bookings ─────────────────────────────────────────────
const getClientBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ clientId: req.user._id })
      .populate('workerId', 'name avatar skills location averageRating reputationTier')
      .populate('reviewId')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 3. Worker: get incoming bookings ────────────────────────────────────────
const getWorkerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ workerId: req.user._id })
      .populate('clientId', 'name email avatar phone')
      .populate('reviewId')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 4. Worker: accept or reject ─────────────────────────────────────────────
const respondToBooking = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body; // action: 'accept' | 'reject'

    const booking = await Booking.findOne({ _id: req.params.id, workerId: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Booking is no longer pending.' });
    }

    if (action === 'accept') {
      booking.status = 'accepted';
      booking.acceptedAt = new Date();
    } else if (action === 'reject') {
      booking.status = 'rejected';
      booking.rejectionReason = rejectionReason || '';
    } else {
      return res.status(400).json({ success: false, message: 'Action must be accept or reject.' });
    }

    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('clientId', 'name email avatar phone')
      .populate('workerId', 'name avatar skills');

    res.json({ success: true, booking: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 5. Worker: start job ────────────────────────────────────────────────────
const startJob = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, workerId: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (booking.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Booking must be accepted before starting.' });
    }

    booking.status = 'in_progress';
    booking.startedAt = new Date();
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('clientId', 'name email avatar phone')
      .populate('workerId', 'name avatar skills');

    res.json({ success: true, booking: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 6. Client: mark job completed ──────────────────────────────────────────
const markCompleted = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, clientId: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (booking.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Job must be in progress to mark as completed.' });
    }

    booking.status = 'awaiting_payment';
    booking.completedAt = new Date();
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('workerId', 'name avatar skills location')
      .populate('clientId', 'name email avatar phone');

    res.json({ success: true, booking: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 7. Client: pay ──────────────────────────────────────────────────────────
const payBooking = async (req, res) => {
  try {
    const { paymentMethod, paymentNote } = req.body;

    if (!['upi', 'card', 'wallet'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'paymentMethod must be upi, card, or wallet.' });
    }

    const booking = await Booking.findOne({ _id: req.params.id, clientId: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (booking.status !== 'awaiting_payment') {
      return res.status(400).json({ success: false, message: 'Booking is not awaiting payment.' });
    }

    booking.status = 'paid';
    booking.paymentMethod = paymentMethod;
    booking.paymentNote = paymentNote || '';
    booking.paidAt = new Date();
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('workerId', 'name avatar skills location')
      .populate('clientId', 'name email avatar phone');

    res.json({ success: true, booking: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 8. Worker: confirm payment received ─────────────────────────────────────
const confirmPayment = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, workerId: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (booking.status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Payment has not been made yet.' });
    }

    booking.status = 'done';
    booking.confirmedAt = new Date();
    await booking.save();

    // Update worker's completed jobs count
    await User.findByIdAndUpdate(booking.workerId, { $inc: { completedJobsCount: 1 } });

    const populated = await Booking.findById(booking._id)
      .populate('clientId', 'name email avatar phone')
      .populate('workerId', 'name avatar skills');

    res.json({ success: true, booking: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 9. Client: submit review after done ─────────────────────────────────────
const submitBookingReview = async (req, res) => {
  try {
    const { rating, comment, tags } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    const booking = await Booking.findOne({ _id: req.params.id, clientId: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (booking.status !== 'done') {
      return res.status(400).json({ success: false, message: 'Review can only be submitted after the job is done.' });
    }
    if (booking.reviewId) {
      return res.status(409).json({ success: false, message: 'Review already submitted.' });
    }

    const review = await BookingReview.create({
      bookingId: booking._id,
      workerId: booking.workerId,
      clientId: req.user._id,
      rating,
      comment: comment || '',
      tags: tags || [],
    });

    booking.reviewId = review._id;
    await booking.save();

    // Update worker's average rating
    const allReviews = await BookingReview.find({ workerId: booking.workerId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(booking.workerId, {
      averageRating: Math.round(avg * 10) / 10,
      totalRatings: allReviews.length,
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 10. Get single booking ──────────────────────────────────────────────────
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('clientId', 'name email avatar phone')
      .populate('workerId', 'name avatar skills location averageRating')
      .populate('reviewId');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    // Only participants can see it
    const uid = req.user._id.toString();
    if (booking.clientId._id.toString() !== uid && booking.workerId._id.toString() !== uid) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
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
};
