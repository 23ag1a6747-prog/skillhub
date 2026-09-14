const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getRecommendations } = require('../controllers/recommendationController');

const router = express.Router();

router.get('/', requireAuth, getRecommendations);

module.exports = router;
