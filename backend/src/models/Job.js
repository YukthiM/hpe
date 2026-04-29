const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    clientName: { type: String }, // For anonymous clients
    clientEmail: { type: String },

    skill: { type: String, required: true },
    location: { type: String },
    amount: { type: Number },
    currency: { type: String, default: 'INR' },

    // QR Code review system
    qrToken: { type: String, unique: true, default: () => uuidv4() },
    qrCodeDataUrl: { type: String }, // base64 QR image
    qrUsed: { type: Boolean, default: false },
    qrUsedAt: { type: Date },

    // Status flow: draft → active → completed → reviewed
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'reviewed'],
      default: 'completed',
    },

    completedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },

    // Linked review
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
