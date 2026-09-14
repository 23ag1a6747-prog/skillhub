const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  issuingOrganization: { type: String, default: '' },
  issueDate: { type: Date, default: Date.now },
  credentialId: { type: String, default: '' },
  certificateUrl: { type: String, default: '' },
  relatedSkills: { type: [String], default: [] },
  relatedCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
