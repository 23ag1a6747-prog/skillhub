const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  listCoursesAdmin,
  createCourse,
  updateCourse,
  deleteCourse,
  verifyCourseLink,
  getBrokenLinks,
  listUsers,
  setUserActive,
  getStats,
} = require('../controllers/adminController');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/stats', getStats);

router.get('/courses', listCoursesAdmin);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);
router.put('/courses/:id/verify', verifyCourseLink);
router.get('/courses-broken', getBrokenLinks);

router.get('/users', listUsers);
router.put('/users/:id/active', setUserActive);

module.exports = router;
