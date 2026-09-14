const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  listCourses,
  getCourse,
  toggleSaveCourse,
  updateProgress,
  getMyLearning,
} = require('../controllers/courseController');

const router = express.Router();

router.get('/', listCourses);
router.get('/my-learning', requireAuth, getMyLearning);
router.get('/:id', getCourse);
router.post('/:id/save', requireAuth, toggleSaveCourse);
router.put('/:id/progress', requireAuth, updateProgress);

module.exports = router;
