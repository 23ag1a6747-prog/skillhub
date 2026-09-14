const { recommendForUser } = require('../services/recommendationService');

async function getRecommendations(req, res, next) {
  try {
    const limit = Math.min(30, Number(req.query.limit) || 10);
    const courses = await recommendForUser(req.user, { limit });
    res.json({ courses, basis: 'rule-based (career goal + skills + interests + level match)' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getRecommendations };
