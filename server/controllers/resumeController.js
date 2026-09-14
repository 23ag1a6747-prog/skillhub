const Resume = require('../models/Resume');
const Certificate = require('../models/Certificate');
const { scoreResume } = require('../services/atsScoreService');

async function getResume(req, res, next) {
  try {
    let resume = await Resume.findOne({ user: req.user._id });
    if (!resume) {
      resume = await Resume.create({
        user: req.user._id,
        personalInfo: { fullName: req.user.name, email: req.user.email },
      });
    }
    res.json({ resume });
  } catch (err) {
    next(err);
  }
}

async function updateResume(req, res, next) {
  try {
    const allowed = [
      'template',
      'sectionOrder',
      'personalInfo',
      'summary',
      'education',
      'skills',
      'projects',
      'certifications',
      'experience',
      'achievements',
      'links',
    ];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const resume = await Resume.findOneAndUpdate({ user: req.user._id }, updates, {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });

    res.json({ resume });
  } catch (err) {
    next(err);
  }
}

/** Pulls skills + certificates from the user profile into the resume draft. */
async function autofillResume(req, res, next) {
  try {
    const user = req.user;
    const certificates = await Certificate.find({ user: user._id }).sort({ issueDate: -1 });

    const resume = await Resume.findOneAndUpdate(
      { user: user._id },
      {
        $set: {
          'personalInfo.fullName': user.name,
          'personalInfo.email': user.email,
          'personalInfo.headline': user.headline || '',
          'personalInfo.location': user.location || '',
          skills: Array.from(new Set(user.currentSkills.map((s) => s.name))),
          certifications: certificates.map((c) => ({
            id: c._id.toString(),
            name: c.name,
            issuingOrganization: c.issuingOrganization,
            issueDate: c.issueDate ? c.issueDate.toISOString().slice(0, 10) : '',
            credentialId: c.credentialId,
          })),
          links: user.links,
        },
      },
      { new: true, upsert: true }
    );

    res.json({ resume });
  } catch (err) {
    next(err);
  }
}

async function getAtsScore(req, res, next) {
  try {
    const resume = await Resume.findOne({ user: req.user._id });
    if (!resume) return res.status(404).json({ message: 'No resume found. Create one first.' });

    const result = scoreResume(resume);
    resume.lastAtsScore = result.score;
    resume.lastAtsCheckedAt = new Date();
    await resume.save();

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getResume, updateResume, autofillResume, getAtsScore };
