const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  platform: { type: String, required: true },
  instructor: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  skills: { type: [String], default: [] },
  difficulty: { type: String, default: 'beginner' },
  durationHours: { type: Number, default: 0 },
  courseUrl: { type: String, default: '' },
  thumbnailUrl: { type: String, default: '' },
  isFree: { type: Boolean, default: true },
  hasCertificate: { type: Boolean, default: false },
  lastVerified: { type: Date, default: Date.now },
  linkStatus: { type: String, default: 'unverified' },
  popularityScore: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  saveCount: { type: Number, default: 0 },
  source: { type: String, default: 'seed' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Powers filter.$text = { $search: q } used in courseController
courseSchema.index({ title: 'text', description: 'text', skills: 'text', instructor: 'text' });

module.exports = mongoose.model('Course', courseSchema);
