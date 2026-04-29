const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['worker', 'client'], required: true },
    phone: { type: String },
    avatar: { type: String, default: '' },

    // Worker-specific fields
    skills: [{ type: String }],
    location: { type: String },
    bio: { type: String, maxlength: 500 },
    experience: { type: Number, default: 0 }, // years

    // Verification
    idVerified: { type: Boolean, default: false },
    idVerificationStatus: {
      type: String,
      enum: ['not_submitted', 'pending', 'verified', 'rejected'],
      default: 'not_submitted',
    },
    idDocumentUrl: { type: String },

    // Reputation
    reputationScore: { type: Number, default: 0, min: 0, max: 100 },
    reputationTier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze',
    },
    completedJobsCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },

    // Badges
    badges: [
      {
        name: { type: String },
        icon: { type: String },
        awardedAt: { type: Date, default: Date.now },
      },
    ],

    // Public profile
    publicProfileSlug: { type: String, unique: true, sparse: true },
    isAvailable: { type: Boolean, default: true },

    // Hourly rate
    hourlyRate: { type: Number },
    rateUnit: { type: String, default: 'hour' },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate slug from name + id fragment
userSchema.methods.generateSlug = function () {
  const base = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `${base}-${this._id.toString().slice(-6)}`;
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
