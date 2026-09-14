require('dotenv').config();
const slugify = require('slugify');
const connectDB = require('../config/db');

const User = require('../models/User');
const Category = require('../models/Category');
const Course = require('../models/Course');
const Certificate = require('../models/Certificate');
const LearningProgress = require('../models/LearningProgress');
const Resume = require('../models/Resume');

const { categories, courses, sampleUser, sampleAdmin, sampleCertificates } = require('./data');

function categorySlugFor(name) {
  return slugify(name, { lower: true });
}

async function run() {
  await connectDB();

  console.log('[seed] Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Course.deleteMany({}),
    Certificate.deleteMany({}),
    LearningProgress.deleteMany({}),
    Resume.deleteMany({}),
  ]);

  console.log('[seed] Inserting categories...');
  const createdCategories = await Category.insertMany(
    categories.map((c) => ({ ...c, slug: categorySlugFor(c.name) }))
  );
  const categoryBySlug = Object.fromEntries(createdCategories.map((c) => [c.slug, c._id]));

  console.log('[seed] Inserting courses...');
  const courseDocs = courses.map((c) => ({
    title: c.title,
    slug: slugify(`${c.title}-${c.platform}`, { lower: true, strict: true }),
    description: c.description,
    platform: c.platform,
    instructor: c.instructor || '',
    category: categoryBySlug[c.categorySlug],
    skills: c.skills,
    difficulty: c.difficulty,
    durationHours: c.durationHours,
    courseUrl: c.courseUrl || (() => {
      const q = encodeURIComponent(`${c.title} ${c.instructor || ''}`.trim());
      if (c.platform === 'YouTube') return `https://www.youtube.com/results?search_query=${q}`;
      if (c.platform === 'Coursera') return `https://www.coursera.org/search?query=${encodeURIComponent(c.title)}`;
      if (c.platform === 'edX') return `https://www.edx.org/search?q=${encodeURIComponent(c.title)}`;
      if (c.platform === 'NPTEL') return `https://nptel.ac.in/courses`;
      return `https://www.google.com/search?q=${q}`;
    })(),
    thumbnailUrl: `https://picsum.photos/seed/${slugify(c.title, { lower: true, strict: true })}/400/240`,
    isFree: true,
    hasCertificate: c.hasCertificate,
    lastVerified: new Date(),
    linkStatus: 'active',
    popularityScore: Math.round(Math.random() * 20 * 100) / 100,
    viewCount: Math.floor(Math.random() * 500),
    saveCount: Math.floor(Math.random() * 100),
    source: 'seed',
  }));
  const createdCourses = await Course.insertMany(courseDocs);

  console.log('[seed] Creating sample admin...');
  const adminPasswordHash = await User.hashPassword(sampleAdmin.password);
  await User.create({
    name: sampleAdmin.name,
    username: sampleAdmin.username,
    email: sampleAdmin.email,
    passwordHash: adminPasswordHash,
    role: 'admin',
    onboardingComplete: true,
  });

  console.log('[seed] Creating sample student user...');
  const passwordHash = await User.hashPassword(sampleUser.password);
  const user = await User.create({
    name: sampleUser.name,
    username: sampleUser.username,
    email: sampleUser.email,
    passwordHash,
    careerGoal: sampleUser.careerGoal,
    currentSkills: sampleUser.currentSkills,
    interestedDomains: sampleUser.interestedDomains,
    skillLevel: sampleUser.skillLevel,
    headline: sampleUser.headline,
    bio: sampleUser.bio,
    location: sampleUser.location,
    onboardingComplete: true,
  });

  console.log('[seed] Creating sample certificates...');
  const certDocs = await Certificate.insertMany(
    sampleCertificates.map((c) => ({ ...c, user: user._id }))
  );

  console.log('[seed] Creating sample learning progress...');
  const dataCourses = createdCourses.filter((c) =>
    ['Python', 'SQL', 'Excel', 'Power BI', 'Statistics', 'Data Analytics'].some((s) => c.skills.includes(s))
  );

  const saved = dataCourses.slice(0, 4);
  const inProgress = dataCourses.slice(4, 6);
  const completed = dataCourses.slice(6, 8);

  await LearningProgress.insertMany([
    ...saved.map((c) => ({ user: user._id, course: c._id, status: 'saved' })),
    ...inProgress.map((c) => ({ user: user._id, course: c._id, status: 'in-progress', progressPercent: 45, startedAt: new Date() })),
    ...completed.map((c) => ({ user: user._id, course: c._id, status: 'completed', progressPercent: 100, startedAt: new Date(), completedAt: new Date() })),
  ]);

  user.savedCourses = saved.map((c) => c._id);
  await user.save();

  console.log('[seed] Creating sample resume...');
  await Resume.create({
    user: user._id,
    template: 'modern',
    personalInfo: {
      fullName: user.name,
      email: user.email,
      phone: '+91 90000 00000',
      location: user.location,
      headline: user.headline,
    },
    summary:
      'Final-year student pursuing a career as a Data Analyst, with hands-on experience in Python, Excel, and SQL through self-paced online coursework and personal projects.',
    education: [
      {
        id: 'edu1',
        institution: 'Osmania University',
        degree: 'B.Tech',
        fieldOfStudy: 'Computer Science',
        startYear: '2022',
        endYear: '2026',
        grade: '8.4 CGPA',
      },
    ],
    skills: ['Python', 'Excel', 'SQL', 'Data Analytics'],
    projects: [
      {
        id: 'proj1',
        title: 'Student Performance Dashboard',
        description:
          'Built an interactive dashboard analyzing student exam performance across 500+ records, identifying key factors behind grade improvement using Python and Power BI.',
        techStack: ['Python', 'Pandas', 'Power BI'],
        projectUrl: '',
      },
    ],
    certifications: certDocs.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      issuingOrganization: c.issuingOrganization,
      issueDate: c.issueDate.toISOString().slice(0, 10),
      credentialId: c.credentialId,
    })),
    experience: [],
    achievements: ['Completed 3 free online certifications in under 6 months while maintaining full-time studies.'],
    links: { linkedin: '', github: '', portfolio: '', website: '' },
  });

  console.log('\n[seed] Done!');
  console.log('-------------------------------------------');
  console.log(' Sample student login:');
  console.log(`   email: ${sampleUser.email}`);
  console.log(`   password: ${sampleUser.password}`);
  console.log(' Sample admin login:');
  console.log(`   email: ${sampleAdmin.email}`);
  console.log(`   password: ${sampleAdmin.password}`);
  console.log('-------------------------------------------');

  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
