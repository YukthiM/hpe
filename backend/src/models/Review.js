const mongoose = require('mongoose');
const crypto = require('crypto');

const reviewSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    qrToken: { type: String, required: true, unique: true },

    // Reviewer info
    reviewerName: { type: String, required: true },
    reviewerEmail: { type: String },

    // Review content
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 },
    tags: [{ type: String }], // e.g. ["punctual", "professional", "quality work"]

    // Blockchain hash simulation — integrity proof
    integrityHash: { type: String },

    // Fraud detection
    ipAddress: { type: String },
    isVerified: { type: Boolean, default: true }, // All QR reviews are verified
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String },
  },
  { timestamps: true }
);

// Generate blockchain-like integrity hash before saving
reviewSchema.pre('save', function (next) {
  if (!this.integrityHash) {
    const payload = `${this._id}:${this.workerId}:${this.qrToken}:${this.rating}:${Date.now()}`;
    this.integrityHash = crypto.createHash('sha256').update(payload).digest('hex');
  }
  next();
});

module.exports = mongoose.model('Review', reviewSchema);
