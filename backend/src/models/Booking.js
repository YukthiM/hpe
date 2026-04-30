const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Status flow
    status: {
      type: String,
      enum: [
        'pending',          // 1. Client sent booking request
        'accepted',         // 3. Worker accepted
        'rejected',         // 3. Worker rejected
        'in_progress',      // 4. Job is underway
        'awaiting_payment', // 5. Client marked completed
        'paid',             // 6. Client paid
        'done',             // 7. Worker confirmed payment received
      ],
      default: 'pending',
    },

    // Client contact info (revealed to worker only after accept)
    clientAddress: { type: String, required: true },
    clientPhone: { type: String, required: true },

    // Optional booking details
    serviceDate: { type: Date },
    notes: { type: String, maxlength: 500 },

    // Payment info
    paymentMethod: { type: String, enum: ['upi', 'card', 'wallet'] },
    paymentNote: { type: String },
    paidAt: { type: Date },

    // Rejection reason
    rejectionReason: { type: String },

    // Linked booking review (after done)
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookingReview' },

    // Status timestamps
    acceptedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    confirmedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
