const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, lowercase: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'student' }, // student | admin
  careerGoal: { type: String, default: '' },
  currentSkills: { type: [{ name: String, source: String }], default: [] },
  interestedDomains: { type: [String], default: [] },
  skillLevel: { type: String, default: 'beginner' },
  onboardingComplete: { type: Boolean, default: false },
  headline: { type: String, default: '' },
  bio: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  location: { type: String, default: '' },
  links: {
    type: Object,
    default: { linkedin: '', github: '', portfolio: '', website: '' },
  },
  isPublicPortfolio: { type: Boolean, default: true },
  savedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// static: User.hashPassword(plain)
userSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 10);
};

// instance: user.comparePassword(candidate)
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

// instance: user.toSafeJSON()
userSchema.methods.toSafeJSON = function () {
  const o = this.toObject();
  delete o.passwordHash;
  return o;
};

module.exports = mongoose.model('User', userSchema);
