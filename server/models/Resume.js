const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  template: { type: String, default: 'modern' },
  sectionOrder: {
    type: [String],
    default: ['summary', 'education', 'skills', 'projects', 'certifications', 'experience', 'achievements', 'links'],
  },
  personalInfo: { type: Object, default: {} },
  summary: { type: String, default: '' },
  education: { type: Array, default: [] },
  skills: { type: [String], default: [] },
  projects: { type: Array, default: [] },
  certifications: { type: Array, default: [] },
  experience: { type: Array, default: [] },
  achievements: { type: [String], default: [] },
  links: { type: Object, default: { linkedin: '', github: '', portfolio: '', website: '' } },
  lastAtsScore: { type: Number, default: null },
  lastAtsCheckedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
