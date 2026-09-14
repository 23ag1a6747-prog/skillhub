const mongoose = require('mongoose');

const learningProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { type: String, default: 'saved' }, // saved | in-progress | completed
  progressPercent: { type: Number, default: 0 },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  lastActivityAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('LearningProgress', learningProgressSchema);
