const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema(
  {
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    // Work images gallery
    workImages: [
      {
        url: { type: String, required: true },
        caption: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Certifications
    certifications: [
      {
        name: { type: String, required: true },
        issuer: { type: String },
        issueDate: { type: Date },
        expiryDate: { type: Date },
        documentUrl: { type: String },
        verified: { type: Boolean, default: false },
      },
    ],

    // About / extended bio
    about: { type: String, maxlength: 2000 },

    // Service areas
    serviceAreas: [{ type: String }],

    // Social links
    socialLinks: {
      linkedin: { type: String },
      website: { type: String },
      instagram: { type: String },
    },

    // Specializations
    specializations: [{ type: String }],

    // Tool/equipment owned
    tools: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);
