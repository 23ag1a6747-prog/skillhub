const express = require('express');
const { getPublicProfile } = require('../controllers/userController');

const router = express.Router();

router.get('/portfolio/:username', getPublicProfile);

module.exports = router;
