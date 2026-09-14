const slugify = require('slugify');
const Course = require('../models/Course');
const User = require('../models/User');
const Category = require('../models/Category');
const LearningProgress = require('../models/LearningProgress');
const Certificate = require('../models/Certificate');

async function listCoursesAdmin(req, res, next) {
  try {
    const { linkStatus, isActive, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (linkStatus) filter.linkStatus = linkStatus;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Course.countDocuments(filter),
    ]);

    res.json({ courses, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  } catch (err) {
    next(err);
  }
}

async function createCourse(req, res, next) {
  try {
    const body = req.body;
    const slug = slugify(`${body.title}-${body.platform}`, { lower: true, strict: true });
    const course = await Course.create({ ...body, slug, source: 'admin', linkStatus: 'unverified' });
    res.status(201).json({ course });
  } catch (err) {
    next(err);
  }
}

async function updateCourse(req, res, next) {
  try {
    const updates = { ...req.body };
    if (updates.title || updates.platform) {
      const existing = await Course.findById(req.params.id);
      if (!existing) return res.status(404).json({ message: 'Course not found.' });
      const title = updates.title || existing.title;
      const platform = updates.platform || existing.platform;
      updates.slug = slugify(`${title}-${platform}`, { lower: true, strict: true });
    }
    const course = await Course.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    res.json({ course });
  } catch (err) {
    next(err);
  }
}

async function deleteCourse(req, res, next) {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    res.json({ message: 'Course deactivated.' });
  } catch (err) {
    next(err);
  }
}

/** Admin marks a course link as verified/active or broken after manual checking. */
async function verifyCourseLink(req, res, next) {
  try {
    const { linkStatus } = req.body; // 'active' | 'broken'
    if (!['active', 'broken'].includes(linkStatus)) {
      return res.status(400).json({ message: "linkStatus must be 'active' or 'broken'." });
    }
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { linkStatus, lastVerified: new Date(), verifiedBy: req.user._id, isActive: linkStatus === 'active' },
      { new: true }
    );
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    res.json({ course });
  } catch (err) {
    next(err);
  }
}

async function getBrokenLinks(req, res, next) {
  try {
    const courses = await Course.find({ linkStatus: 'broken' }).sort({ lastVerified: 1 });
    res.json({ courses });
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

async function setUserActive(req, res, next) {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const [totalUsers, totalCourses, activeCourses, brokenLinks, totalCertificates, completedCount] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Course.countDocuments({ isActive: true }),
      Course.countDocuments({ linkStatus: 'broken' }),
      Certificate.countDocuments(),
      LearningProgress.countDocuments({ status: 'completed' }),
    ]);

    const byPlatform = await Course.aggregate([{ $group: { _id: '$platform', count: { $sum: 1 } } }]);
    const byCategory = await Course.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $project: { count: 1, name: '$category.name' } },
    ]);

    res.json({
      totalUsers,
      totalCourses,
      activeCourses,
      brokenLinks,
      totalCertificates,
      completedCourseCount: completedCount,
      byPlatform,
      byCategory,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCoursesAdmin,
  createCourse,
  updateCourse,
  deleteCourse,
  verifyCourseLink,
  getBrokenLinks,
  listUsers,
  setUserActive,
  getStats,
};
