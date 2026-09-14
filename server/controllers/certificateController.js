const Certificate = require('../models/Certificate');
const User = require('../models/User');

async function listCertificates(req, res, next) {
  try {
    const certificates = await Certificate.find({ user: req.user._id }).sort({ issueDate: -1 });
    res.json({ certificates });
  } catch (err) {
    next(err);
  }
}

async function createCertificate(req, res, next) {
  try {
    const payload = { ...req.body, user: req.user._id };
    const certificate = await Certificate.create(payload);

    // Auto-add related skills to the user's profile
    if (payload.relatedSkills?.length) {
      const user = await User.findById(req.user._id);
      const existing = new Set(user.currentSkills.map((s) => s.name.toLowerCase()));
      payload.relatedSkills.forEach((skill) => {
        if (!existing.has(skill.toLowerCase())) {
          user.currentSkills.push({ name: skill, source: 'certificate' });
          existing.add(skill.toLowerCase());
        }
      });
      await user.save();
    }

    res.status(201).json({ certificate });
  } catch (err) {
    next(err);
  }
}

async function updateCertificate(req, res, next) {
  try {
    const certificate = await Certificate.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!certificate) return res.status(404).json({ message: 'Certificate not found.' });
    res.json({ certificate });
  } catch (err) {
    next(err);
  }
}

async function deleteCertificate(req, res, next) {
  try {
    const certificate = await Certificate.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!certificate) return res.status(404).json({ message: 'Certificate not found.' });
    res.json({ message: 'Certificate deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCertificates, createCertificate, updateCertificate, deleteCertificate };
