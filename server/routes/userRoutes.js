const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  getMe,
  updateMe,
  completeOnboarding,
  addSkill,
  removeSkill,
  getDashboard,
} = require('../controllers/userController');

const router = express.Router();

router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, updateMe);
router.post('/me/onboarding', requireAuth, completeOnboarding);
router.post('/me/skills', requireAuth, addSkill);
router.delete('/me/skills/:skillName', requireAuth, removeSkill);
router.get('/me/dashboard', requireAuth, getDashboard);

module.exports = router;
