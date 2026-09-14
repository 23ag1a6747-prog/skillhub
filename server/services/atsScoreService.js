/**
 * SkillHub Resume-Quality (ATS) Score.
 *
 * IMPORTANT: This is SkillHub's own heuristic estimate of resume quality and
 * ATS-friendliness. It does NOT represent, simulate, or guarantee how any
 * specific company's actual applicant tracking system will parse or rank
 * the resume. The score and suggestions are for guidance only.
 */

const MEASURABLE_WORD_REGEX = /\b\d+(\.\d+)?\s?(%|percent|x|k|hours|hrs|users|students|projects|days|weeks|months|years)\b/i;
const WEAK_SUMMARY_WORDS = ['hardworking', 'team player', 'passionate', 'dynamic', 'results-oriented'];

function scoreResume(resume) {
  const suggestions = [];
  let score = 0;
  const maxScore = 100;

  // Contact info - 15 pts
  const contact = resume.personalInfo || {};
  let contactPts = 0;
  if (contact.fullName) contactPts += 4;
  else suggestions.push('Add your full name to the personal information section.');
  if (contact.email) contactPts += 4;
  else suggestions.push('Add a professional email address.');
  if (contact.phone) contactPts += 3;
  else suggestions.push('Add a phone number so recruiters can reach you.');
  if (contact.location) contactPts += 2;
  else suggestions.push('Add your city/location.');
  if (resume.links && (resume.links.linkedin || resume.links.github || resume.links.portfolio)) contactPts += 2;
  else suggestions.push('Add at least one professional link (LinkedIn, GitHub, or portfolio).');
  score += contactPts;

  // Summary - 15 pts
  const summary = (resume.summary || '').trim();
  let summaryPts = 0;
  if (!summary) {
    suggestions.push('Add a career summary/objective (2-3 sentences) at the top of your resume.');
  } else if (summary.split(/\s+/).length < 15) {
    summaryPts += 6;
    suggestions.push('Your summary is quite short — expand it to 2-3 sentences covering your goal, strengths, and key skills.');
  } else {
    summaryPts += 15;
  }
  const lowerSummary = summary.toLowerCase();
  if (WEAK_SUMMARY_WORDS.some((w) => lowerSummary.includes(w))) {
    summaryPts = Math.max(0, summaryPts - 3);
    suggestions.push('Replace generic buzzwords in your summary (e.g. "hardworking", "passionate") with specific, concrete strengths.');
  }
  score += summaryPts;

  // Skills - 15 pts
  const skills = resume.skills || [];
  let skillsPts = 0;
  if (skills.length === 0) suggestions.push('Add relevant technical and soft skills — this is one of the most scanned sections by ATS systems.');
  else if (skills.length < 5) {
    skillsPts += 8;
    suggestions.push('List at least 5-10 relevant skills to improve keyword matching.');
  } else {
    skillsPts += 15;
  }
  score += skillsPts;

  // Education - 10 pts
  const education = resume.education || [];
  score += education.length > 0 ? 10 : 0;
  if (education.length === 0) suggestions.push('Add your education details.');

  // Projects - 15 pts
  const projects = resume.projects || [];
  let projectPts = 0;
  if (projects.length === 0) {
    suggestions.push('Add at least 1-2 projects with clear descriptions and technologies used.');
  } else {
    const withDescriptions = projects.filter((p) => (p.description || '').trim().length >= 30);
    projectPts = Math.min(15, withDescriptions.length * 6 + (projects.length - withDescriptions.length) * 2);
    if (withDescriptions.length < projects.length) {
      suggestions.push('Some projects have very short descriptions — describe what you built, the tech stack, and the outcome.');
    }
  }
  score += projectPts;

  // Certifications - 10 pts
  const certifications = resume.certifications || [];
  score += certifications.length > 0 ? 10 : 0;
  if (certifications.length === 0) suggestions.push('Add certifications from SKILLHUB or elsewhere to strengthen credibility.');

  // Experience - 10 pts
  const experience = resume.experience || [];
  score += experience.length > 0 ? 10 : 5;
  if (experience.length === 0) {
    suggestions.push('If you have internships, freelance work, or volunteer roles, add them under Experience.');
  }

  // Measurable achievements - 10 pts
  const achievements = resume.achievements || [];
  const allText = [
    ...achievements,
    ...projects.map((p) => p.description || ''),
    ...experience.map((e) => e.description || ''),
  ].join(' ');
  let achievementPts = 0;
  if (achievements.length > 0) achievementPts += 5;
  else suggestions.push('Add measurable achievements (e.g. awards, rankings, competition results).');
  if (MEASURABLE_WORD_REGEX.test(allText)) achievementPts += 5;
  else suggestions.push('Quantify your impact where possible (e.g. "improved load time by 30%", "built a tool used by 200+ students").');
  score += achievementPts;

  const finalScore = Math.max(0, Math.min(maxScore, Math.round(score)));

  let rating = 'Needs Work';
  if (finalScore >= 85) rating = 'Excellent';
  else if (finalScore >= 70) rating = 'Good';
  else if (finalScore >= 50) rating = 'Fair';

  return {
    score: finalScore,
    rating,
    suggestions,
    disclaimer:
      "This is SkillHub's own resume-quality estimate, not a simulation of any specific company's ATS software.",
  };
}

module.exports = { scoreResume };
