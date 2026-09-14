const Course = require('../models/Course');

/**
 * Rule-based recommendation engine.
 *
 * This is intentionally simple and transparent (NOT machine learning) so it
 * is honest about what it does. It scores each active course against the
 * student's profile using weighted keyword overlap.
 *
 * ARCHITECTURE NOTE:
 * This function is the single seam where a real ML/AI recommender could be
 * swapped in later. A future implementation could:
 *   1. Keep the same signature: recommendForUser(user, { limit }) -> Course[]
 *   2. Replace the scoring logic below with a call to a model service
 *      (e.g. a vector-similarity search or a hosted recommendation API).
 * Nothing else in the codebase needs to change.
 */

// Maps common career goals to a starter set of related skills/keywords.
// This is used only to widen the search when the user has few explicit skills.
const CAREER_GOAL_SKILL_MAP = {
  'data analyst': ['python', 'sql', 'excel', 'power bi', 'statistics', 'data analytics', 'tableau'],
  'data scientist': ['python', 'machine learning', 'statistics', 'sql', 'deep learning', 'pandas'],
  'web developer': ['html', 'css', 'javascript', 'react', 'node.js', 'apis'],
  'frontend developer': ['html', 'css', 'javascript', 'react', 'ui/ux', 'tailwind'],
  'backend developer': ['node.js', 'express', 'databases', 'apis', 'system design', 'sql'],
  'full stack developer': ['javascript', 'react', 'node.js', 'mongodb', 'sql', 'apis'],
  'ml engineer': ['python', 'machine learning', 'deep learning', 'tensorflow', 'pytorch'],
  'cloud engineer': ['aws', 'azure', 'cloud computing', 'devops', 'docker', 'kubernetes'],
  'android developer': ['java', 'kotlin', 'android', 'mobile development'],
  'product manager': ['product management', 'agile', 'communication', 'analytics'],
  'ui/ux designer': ['ui/ux', 'figma', 'design thinking', 'prototyping'],
  'cybersecurity analyst': ['networking', 'security', 'linux', 'ethical hacking'],
};

function normalize(str) {
  return (str || '').toString().trim().toLowerCase();
}

function expandKeywords(user) {
  const keywords = new Set();

  (user.currentSkills || []).forEach((s) => keywords.add(normalize(s.name)));
  (user.interestedDomains || []).forEach((d) => keywords.add(normalize(d)));

  const goalKey = normalize(user.careerGoal);
  if (CAREER_GOAL_SKILL_MAP[goalKey]) {
    CAREER_GOAL_SKILL_MAP[goalKey].forEach((k) => keywords.add(k));
  } else if (goalKey) {
    keywords.add(goalKey);
  }

  return Array.from(keywords).filter(Boolean);
}

function scoreCourse(course, keywords, user) {
  let score = 0;
  const courseSkills = (course.skills || []).map(normalize);
  const haystack = `${normalize(course.title)} ${normalize(course.description)}`;

  keywords.forEach((kw) => {
    if (courseSkills.some((s) => s.includes(kw) || kw.includes(s))) score += 3;
    else if (haystack.includes(kw)) score += 1;
  });

  if (user.skillLevel && course.difficulty) {
    const levelMap = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
    if (levelMap[user.skillLevel] === course.difficulty) score += 1.5;
  }

  // Small nudge for popularity/certificate availability so ties break sensibly
  score += Math.min(course.popularityScore || 0, 5) * 0.1;
  if (course.hasCertificate) score += 0.25;

  return score;
}

async function recommendForUser(user, { limit = 10 } = {}) {
  const keywords = expandKeywords(user);

  const courses = await Course.find({ isActive: true }).populate('category', 'name slug').lean();

  const scored = courses
    .map((course) => ({ course, score: scoreCourse(course, keywords, user) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => ({ ...entry.course, matchScore: Number(entry.score.toFixed(2)) }));

  // Fallback: if the profile is too sparse to match anything, surface popular
  // beginner-friendly courses so the dashboard is never empty.
  if (scored.length === 0) {
    const fallback = await Course.find({ isActive: true })
      .sort({ popularityScore: -1 })
      .limit(limit)
      .populate('category', 'name slug')
      .lean();
    return fallback.map((c) => ({ ...c, matchScore: 0 }));
  }

  return scored;
}

module.exports = { recommendForUser, expandKeywords, CAREER_GOAL_SKILL_MAP };
