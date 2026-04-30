const mongoose = require('mongoose');

const bookingReviewSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    workerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    clientId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },

    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 },
    tags:    [{ type: String }], // e.g. ["punctual", "professional"]
  },
  { timestamps: true }
);

module.exports = mongoose.model('BookingReview', bookingReviewSchema);
