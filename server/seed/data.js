const categories = [
  { name: 'Data Science & Analytics', description: 'Data analysis, statistics, visualization, and machine learning.', icon: 'bar-chart' },
  { name: 'Web Development', description: 'Frontend, backend, and full-stack web development.', icon: 'code' },
  { name: 'Programming Fundamentals', description: 'Core programming languages and computer science basics.', icon: 'terminal' },
  { name: 'Cloud & DevOps', description: 'Cloud platforms, containers, and deployment pipelines.', icon: 'cloud' },
  { name: 'Design & Productivity', description: 'UI/UX design, tools, and career/productivity skills.', icon: 'layout' },
];

// categorySlug is used only to map to the created Category _id during seeding.
const courses = [
  // --- Data Science & Analytics ---
  { title: 'Python for Data Analysis', platform: 'YouTube', instructor: 'freeCodeCamp', categorySlug: 'data-science-analytics', skills: ['Python', 'Pandas', 'NumPy', 'Data Analytics'], difficulty: 'Beginner', durationHours: 12, hasCertificate: false, description: 'A hands-on introduction to using Python, Pandas, and NumPy for real-world data analysis tasks.' },
  { title: 'SQL for Data Science', platform: 'Coursera', instructor: 'UC Davis', categorySlug: 'data-science-analytics', skills: ['SQL', 'Data Analytics', 'Databases'], difficulty: 'Beginner', durationHours: 18, hasCertificate: true, description: 'Learn to write SQL queries to explore, join, and analyze data across relational databases.' },
  { title: 'Introduction to Statistics', platform: 'edX', instructor: 'MIT', categorySlug: 'data-science-analytics', skills: ['Statistics', 'Probability', 'Data Analytics'], difficulty: 'Intermediate', durationHours: 40, hasCertificate: true, description: 'A rigorous introduction to probability and statistics for data-driven decision making.' },
  { title: 'Data Analytics with Excel', platform: 'YouTube', instructor: 'Kevin Stratvert', categorySlug: 'data-science-analytics', skills: ['Excel', 'Data Analytics'], difficulty: 'Beginner', durationHours: 6, hasCertificate: false, description: 'Master pivot tables, formulas, and dashboards in Excel for practical data analysis.' },
  { title: 'Power BI for Beginners', platform: 'YouTube', instructor: 'Guy in a Cube', categorySlug: 'data-science-analytics', skills: ['Power BI', 'Data Visualization', 'Data Analytics'], difficulty: 'Beginner', durationHours: 10, hasCertificate: false, description: 'Build interactive dashboards and reports using Power BI, from data import to publishing.' },
  { title: 'NPTEL: Data Science for Engineers', platform: 'NPTEL', instructor: 'IIT Madras', categorySlug: 'data-science-analytics', skills: ['Python', 'Statistics', 'Machine Learning', 'Data Analytics'], difficulty: 'Intermediate', durationHours: 45, hasCertificate: true, description: 'A comprehensive NPTEL course covering the data science pipeline for engineering applications.' },
  { title: 'Machine Learning Specialization', platform: 'Coursera', instructor: 'Andrew Ng (Stanford)', categorySlug: 'data-science-analytics', skills: ['Machine Learning', 'Python', 'Statistics'], difficulty: 'Intermediate', durationHours: 60, hasCertificate: true, description: 'The renowned specialization covering supervised learning, neural networks, and best practices.' },
  { title: 'Data Visualization with Tableau', platform: 'YouTube', instructor: 'Tableau', categorySlug: 'data-science-analytics', skills: ['Tableau', 'Data Visualization', 'Data Analytics'], difficulty: 'Beginner', durationHours: 8, hasCertificate: false, description: 'Learn to create compelling, interactive visualizations and dashboards in Tableau.' },
  { title: 'Deep Learning Specialization', platform: 'Coursera', instructor: 'Andrew Ng (DeepLearning.AI)', categorySlug: 'data-science-analytics', skills: ['Deep Learning', 'Python', 'Neural Networks'], difficulty: 'Advanced', durationHours: 80, hasCertificate: true, description: 'A deep dive into neural networks, CNNs, RNNs, and building real deep learning applications.' },
  { title: 'NPTEL: Statistics for Data Science', platform: 'NPTEL', instructor: 'IIT Kharagpur', categorySlug: 'data-science-analytics', skills: ['Statistics', 'Data Analytics'], difficulty: 'Beginner', durationHours: 30, hasCertificate: true, description: 'Foundational statistics concepts applied specifically to data science workflows.' },

  // --- Web Development ---
  { title: 'The Complete JavaScript Course', platform: 'YouTube', instructor: 'Programming with Mosh', categorySlug: 'web-development', skills: ['JavaScript', 'Web Development'], difficulty: 'Beginner', durationHours: 15, hasCertificate: false, description: 'Covers JavaScript fundamentals through advanced concepts like closures, async/await, and the DOM.' },
  { title: 'React - The Complete Guide', platform: 'YouTube', instructor: 'freeCodeCamp', categorySlug: 'web-development', skills: ['React', 'JavaScript', 'Web Development'], difficulty: 'Intermediate', durationHours: 20, hasCertificate: false, description: 'Build modern single-page applications with React, hooks, and component architecture.' },
  { title: 'Node.js and Express.js Full Course', platform: 'YouTube', instructor: 'freeCodeCamp', categorySlug: 'web-development', skills: ['Node.js', 'Express', 'APIs', 'Web Development'], difficulty: 'Intermediate', durationHours: 8, hasCertificate: false, description: 'Learn to build REST APIs and backend services using Node.js and Express.' },
  { title: 'HTML, CSS, and Web Design', platform: 'edX', instructor: 'W3C', categorySlug: 'web-development', skills: ['HTML', 'CSS', 'Web Development'], difficulty: 'Beginner', durationHours: 25, hasCertificate: true, description: 'A structured introduction to semantic HTML and modern responsive CSS layout techniques.' },
  { title: 'Full-Stack Web Development with MERN', platform: 'Coursera', instructor: 'Hong Kong Univ. of Science & Tech.', categorySlug: 'web-development', skills: ['MongoDB', 'Express', 'React', 'Node.js'], difficulty: 'Intermediate', durationHours: 50, hasCertificate: true, description: 'Build full-stack applications using MongoDB, Express, React, and Node.js.' },
  { title: 'Responsive Web Design', platform: 'YouTube', instructor: 'Kevin Powell', categorySlug: 'web-development', skills: ['CSS', 'Responsive Design', 'Web Development'], difficulty: 'Beginner', durationHours: 10, hasCertificate: false, description: 'Master flexbox, grid, and media queries to build layouts that work on any device.' },
  { title: 'TypeScript Fundamentals', platform: 'YouTube', instructor: 'Academind', categorySlug: 'web-development', skills: ['TypeScript', 'JavaScript', 'Web Development'], difficulty: 'Intermediate', durationHours: 9, hasCertificate: false, description: 'Learn static typing, interfaces, and generics to write safer JavaScript applications.' },
  { title: 'NPTEL: Modern Application Development', platform: 'NPTEL', instructor: 'IIT Madras', categorySlug: 'web-development', skills: ['Web Development', 'JavaScript', 'Databases'], difficulty: 'Intermediate', durationHours: 40, hasCertificate: true, description: 'Covers modern web application architecture, APIs, and deployment practices.' },

  // --- Programming Fundamentals ---
  { title: 'CS50: Introduction to Computer Science', platform: 'edX', instructor: 'Harvard University', categorySlug: 'programming-fundamentals', skills: ['C', 'Python', 'Algorithms', 'Data Structures'], difficulty: 'Beginner', durationHours: 100, hasCertificate: true, description: "Harvard's legendary introduction to computer science and the art of programming." },
  { title: 'Python for Everybody', platform: 'Coursera', instructor: 'University of Michigan', categorySlug: 'programming-fundamentals', skills: ['Python', 'Programming Basics'], difficulty: 'Beginner', durationHours: 30, hasCertificate: true, description: 'A gentle, thorough introduction to Python programming for absolute beginners.' },
  { title: 'Data Structures and Algorithms', platform: 'YouTube', instructor: 'CS Dojo', categorySlug: 'programming-fundamentals', skills: ['Data Structures', 'Algorithms', 'Python'], difficulty: 'Intermediate', durationHours: 14, hasCertificate: false, description: 'Learn core data structures and algorithmic problem-solving techniques for interviews.' },
  { title: 'NPTEL: Programming in Java', platform: 'NPTEL', instructor: 'IIT Kharagpur', categorySlug: 'programming-fundamentals', skills: ['Java', 'OOP', 'Programming Basics'], difficulty: 'Beginner', durationHours: 35, hasCertificate: true, description: 'A structured NPTEL course covering Java syntax, OOP, and application development.' },
  { title: 'Introduction to C++', platform: 'YouTube', instructor: 'freeCodeCamp', categorySlug: 'programming-fundamentals', skills: ['C++', 'Programming Basics'], difficulty: 'Beginner', durationHours: 11, hasCertificate: false, description: 'A complete beginner course covering C++ syntax, memory management, and OOP basics.' },
  { title: 'Git and GitHub for Beginners', platform: 'YouTube', instructor: 'freeCodeCamp', categorySlug: 'programming-fundamentals', skills: ['Git', 'GitHub', 'Version Control'], difficulty: 'Beginner', durationHours: 4, hasCertificate: false, description: 'Learn version control fundamentals and collaborative workflows using Git and GitHub.' },

  // --- Cloud & DevOps ---
  { title: 'AWS Cloud Practitioner Essentials', platform: 'Coursera', instructor: 'Amazon Web Services', categorySlug: 'cloud-devops', skills: ['AWS', 'Cloud Computing'], difficulty: 'Beginner', durationHours: 12, hasCertificate: true, description: 'A foundational overview of AWS services, pricing, and cloud computing concepts.' },
  { title: 'Docker and Kubernetes Full Course', platform: 'YouTube', instructor: 'TechWorld with Nana', categorySlug: 'cloud-devops', skills: ['Docker', 'Kubernetes', 'DevOps'], difficulty: 'Intermediate', durationHours: 16, hasCertificate: false, description: 'Learn containerization with Docker and orchestration with Kubernetes from scratch.' },
  { title: 'Introduction to DevOps', platform: 'edX', instructor: 'Linux Foundation', categorySlug: 'cloud-devops', skills: ['DevOps', 'CI/CD', 'Cloud Computing'], difficulty: 'Beginner', durationHours: 20, hasCertificate: true, description: 'Covers DevOps culture, CI/CD pipelines, and infrastructure automation basics.' },
  { title: 'NPTEL: Cloud Computing', platform: 'NPTEL', instructor: 'IIT Kharagpur', categorySlug: 'cloud-devops', skills: ['Cloud Computing', 'Virtualization'], difficulty: 'Intermediate', durationHours: 40, hasCertificate: true, description: 'An in-depth NPTEL course on cloud computing architectures, services, and virtualization.' },

  // --- Design & Productivity ---
  { title: 'UI/UX Design Fundamentals', platform: 'YouTube', instructor: 'DesignCourse', categorySlug: 'design-productivity', skills: ['UI/UX', 'Figma', 'Design Thinking'], difficulty: 'Beginner', durationHours: 9, hasCertificate: false, description: 'Learn the fundamentals of user interface and user experience design using Figma.' },
  { title: 'Google UX Design Certificate (Intro)', platform: 'Coursera', instructor: 'Google', categorySlug: 'design-productivity', skills: ['UI/UX', 'Design Thinking', 'Prototyping'], difficulty: 'Beginner', durationHours: 25, hasCertificate: true, description: 'An industry-recognized introduction to the UX design process, from research to prototyping.' },
  { title: 'Effective Communication Skills', platform: 'edX', instructor: 'University of Queensland', categorySlug: 'design-productivity', skills: ['Communication', 'Career Skills'], difficulty: 'Beginner', durationHours: 10, hasCertificate: true, description: 'Build professional communication skills for the workplace and job interviews.' },
];

const sampleUser = {
  name: 'Aditi Sharma',
  username: 'aditisharma',
  email: 'aditi@example.com',
  password: 'Password123',
  careerGoal: 'Data Analyst',
  currentSkills: [
    { name: 'Python', source: 'manual' },
    { name: 'Excel', source: 'manual' },
  ],
  interestedDomains: ['Data Science'],
  skillLevel: 'beginner',
  headline: 'Aspiring Data Analyst | Python & SQL enthusiast',
  bio: 'Final-year student building data analytics skills through free online courses.',
  location: 'Hyderabad, India',
};

const sampleAdmin = {
  name: 'SkillHub Admin',
  username: 'admin',
  email: 'admin@skillhub.dev',
  password: 'AdminPass123',
  role: 'admin',
};

const sampleCertificates = [
  {
    name: 'Python for Everybody',
    issuingOrganization: 'University of Michigan (Coursera)',
    issueDate: new Date('2025-11-10'),
    credentialId: 'COURSERA-PY4E-88213',
    relatedSkills: ['Python', 'Programming Basics'],
  },
  {
    name: 'Data Analytics with Excel',
    issuingOrganization: 'SkillHub Verified',
    issueDate: new Date('2025-12-02'),
    credentialId: 'SKH-EXCEL-2025-441',
    relatedSkills: ['Excel', 'Data Analytics'],
  },
];

module.exports = { categories, courses, sampleUser, sampleAdmin, sampleCertificates };
