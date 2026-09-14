const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getResume, updateResume, autofillResume, getAtsScore } = require('../controllers/resumeController');

const router = express.Router();

router.use(requireAuth);

router.get('/', getResume);
router.put('/', updateResume);
router.post('/autofill', autofillResume);
router.get('/ats-score', getAtsScore);

module.exports = router;
