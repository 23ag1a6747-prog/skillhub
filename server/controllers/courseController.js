const Course = require('../models/Course');
const LearningProgress = require('../models/LearningProgress');
const User = require('../models/User');

/** GET /api/courses - search + filter + sort + paginate */
async function listCourses(req, res, next) {
  try {
    const {
      q,
      skill,
      platform,
      category,
      difficulty,
      minDuration,
      maxDuration,
      certificate,
      isFree,
      sort = 'relevance',
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { isActive: true };

    if (platform) filter.platform = platform;
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (certificate !== undefined) filter.hasCertificate = certificate === 'true';
    if (isFree !== undefined) filter.isFree = isFree === 'true';
    if (skill) filter.skills = { $regex: skill, $options: 'i' };
    if (minDuration || maxDuration) {
      filter.durationHours = {};
      if (minDuration) filter.durationHours.$gte = Number(minDuration);
      if (maxDuration) filter.durationHours.$lte = Number(maxDuration);
    }
    if (q) filter.$text = { $search: q };

    const sortMap = {
      relevance: q ? { score: { $meta: 'textScore' } } : { popularityScore: -1 },
      popularity: { popularityScore: -1 },
      newest: { createdAt: -1 },
      durationAsc: { durationHours: 1 },
      durationDesc: { durationHours: -1 },
    };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));

    let query = Course.find(filter, q ? { score: { $meta: 'textScore' } } : undefined)
      .populate('category', 'name slug')
      .sort(sortMap[sort] || sortMap.relevance)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const [courses, total] = await Promise.all([query, Course.countDocuments(filter)]);

    res.json({
      courses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id).populate('category', 'name slug');
    if (!course || !course.isActive) return res.status(404).json({ message: 'Course not found.' });

    course.viewCount += 1;
    course.popularityScore = course.viewCount * 0.1 + course.saveCount * 0.5;
    await course.save();

    res.json({ course });
  } catch (err) {
    next(err);
  }
}

/** POST /api/courses/:id/save - toggle bookmark + create/find progress row */
async function toggleSaveCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    const user = await User.findById(req.user._id);
    const idx = user.savedCourses.findIndex((c) => c.toString() === course._id.toString());
    let saved;

    if (idx >= 0) {
      user.savedCourses.splice(idx, 1);
      course.saveCount = Math.max(0, course.saveCount - 1);
      saved = false;
      await LearningProgress.findOneAndDelete({ user: user._id, course: course._id, status: 'saved' });
    } else {
      user.savedCourses.push(course._id);
      course.saveCount += 1;
      saved = true;
      await LearningProgress.findOneAndUpdate(
        { user: user._id, course: course._id },
        { $setOnInsert: { status: 'saved' }, lastActivityAt: new Date() },
        { upsert: true, new: true }
      );
    }

    course.popularityScore = course.viewCount * 0.1 + course.saveCount * 0.5;
    await Promise.all([user.save(), course.save()]);

    res.json({ saved, savedCourses: user.savedCourses });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/courses/:id/progress - update learning progress status/percent */
async function updateProgress(req, res, next) {
  try {
    const { status, progressPercent } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    const update = { lastActivityAt: new Date() };
    if (status) update.status = status;
    if (progressPercent !== undefined) update.progressPercent = Math.max(0, Math.min(100, Number(progressPercent)));
    if (status === 'in-progress') update.startedAt = update.startedAt || new Date();
    if (status === 'completed') {
      update.completedAt = new Date();
      update.progressPercent = 100;
    }

    const progress = await LearningProgress.findOneAndUpdate(
      { user: req.user._id, course: course._id },
      { $set: update, $setOnInsert: { user: req.user._id, course: course._id } },
      { upsert: true, new: true }
    ).populate('course', 'title thumbnailUrl skills');

    // If completed, auto-suggest adding the course's skills to the profile.
    if (status === 'completed') {
      const user = await User.findById(req.user._id);
      const existingNames = new Set(user.currentSkills.map((s) => s.name.toLowerCase()));
      (course.skills || []).forEach((skill) => {
        if (!existingNames.has(skill.toLowerCase())) {
          user.currentSkills.push({ name: skill, source: 'course' });
          existingNames.add(skill.toLowerCase());
        }
      });
      await user.save();
    }

    res.json({ progress });
  } catch (err) {
    next(err);
  }
}

async function getMyLearning(req, res, next) {
  try {
    const progress = await LearningProgress.find({ user: req.user._id })
      .populate({ path: 'course', populate: { path: 'category', select: 'name slug' } })
      .sort({ lastActivityAt: -1 });
    res.json({ progress });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCourses,
  getCourse,
  toggleSaveCourse,
  updateProgress,
  getMyLearning,
};
