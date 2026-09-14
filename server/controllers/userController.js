const User = require('../models/User');
const Certificate = require('../models/Certificate');
const LearningProgress = require('../models/LearningProgress');
const Resume = require('../models/Resume');
const Course = require('../models/Course');

async function getMe(req, res) {
  res.json({ user: req.user.toSafeJSON() });
}

async function updateMe(req, res, next) {
  try {
    const allowed = [
      'name',
      'headline',
      'bio',
      'avatarUrl',
      'location',
      'links',
      'careerGoal',
      'currentSkills',
      'interestedDomains',
      'skillLevel',
      'isPublicPortfolio',
    ];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

async function completeOnboarding(req, res, next) {
  try {
    const { careerGoal, currentSkills = [], interestedDomains = [], skillLevel } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        careerGoal,
        currentSkills: currentSkills.map((s) => (typeof s === 'string' ? { name: s, source: 'manual' } : s)),
        interestedDomains,
        skillLevel,
        onboardingComplete: true,
      },
      { new: true, runValidators: true }
    );

    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

async function addSkill(req, res, next) {
  try {
    const { name, source = 'manual' } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Skill name is required.' });

    const user = await User.findById(req.user._id);
    const exists = user.currentSkills.some((s) => s.name.toLowerCase() === name.trim().toLowerCase());
    if (!exists) {
      user.currentSkills.push({ name: name.trim(), source });
      await user.save();
    }
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

async function removeSkill(req, res, next) {
  try {
    const { skillName } = req.params;
    const user = await User.findById(req.user._id);
    user.currentSkills = user.currentSkills.filter((s) => s.name.toLowerCase() !== skillName.toLowerCase());
    await user.save();
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

/** Aggregated dashboard payload used by the student dashboard page. */
async function getDashboard(req, res, next) {
  try {
    const userId = req.user._id;

    const [savedCount, inProgress, completed, certificates, resume, user] = await Promise.all([
      LearningProgress.countDocuments({ user: userId, status: 'saved' }),
      LearningProgress.find({ user: userId, status: 'in-progress' })
        .populate('course', 'title thumbnailUrl platform durationHours')
        .sort({ lastActivityAt: -1 })
        .limit(10),
      LearningProgress.find({ user: userId, status: 'completed' })
        .populate('course', 'title thumbnailUrl platform durationHours')
        .sort({ completedAt: -1 })
        .limit(10),
      Certificate.find({ user: userId }).sort({ issueDate: -1 }),
      Resume.findOne({ user: userId }),
      User.findById(userId).populate('savedCourses', 'title thumbnailUrl platform difficulty'),
    ]);

    const totalFields = 8; // rough completeness heuristic across resume sections
    let filled = 0;
    if (resume) {
      if (resume.summary) filled += 1;
      if (resume.education?.length) filled += 1;
      if (resume.skills?.length) filled += 1;
      if (resume.projects?.length) filled += 1;
      if (resume.certifications?.length) filled += 1;
      if (resume.experience?.length) filled += 1;
      if (resume.achievements?.length) filled += 1;
      if (resume.personalInfo?.fullName && resume.personalInfo?.email) filled += 1;
    }
    const resumeCompletion = Math.round((filled / totalFields) * 100);

    res.json({
      welcomeName: user.name,
      careerGoal: user.careerGoal,
      stats: {
        savedCourses: savedCount,
        inProgressCourses: inProgress.length,
        completedCourses: completed.length,
        totalSkills: user.currentSkills.length,
        totalCertificates: certificates.length,
        resumeCompletion,
      },
      savedCourses: user.savedCourses,
      inProgressCourses: inProgress,
      completedCourses: completed,
      skills: user.currentSkills,
      certificates,
      recentActivity: [...inProgress, ...completed]
        .sort((a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt))
        .slice(0, 5),
    });
  } catch (err) {
    next(err);
  }
}

/** Public portfolio view - no auth required, only public fields returned. */
async function getPublicProfile(req, res, next) {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase(), isPublicPortfolio: true });
    if (!user) return res.status(404).json({ message: 'Profile not found or not public.' });

    const [certificates, resume, completedProgress] = await Promise.all([
      Certificate.find({ user: user._id }).sort({ issueDate: -1 }),
      Resume.findOne({ user: user._id }),
      LearningProgress.find({ user: user._id, status: 'completed' }).populate('course', 'title platform'),
    ]);

    res.json({
      name: user.name,
      username: user.username,
      headline: user.headline,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      location: user.location,
      links: user.links,
      careerGoal: user.careerGoal,
      skills: user.currentSkills,
      certificates,
      projects: resume?.projects || [],
      completedCourses: completedProgress.map((p) => p.course).filter(Boolean),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMe,
  updateMe,
  completeOnboarding,
  addSkill,
  removeSkill,
  getDashboard,
  getPublicProfile,
};
