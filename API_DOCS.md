# SkillHub API Reference

Base URL: `http://localhost:5000/api` (or your deployed backend + `/api`)

All authenticated routes expect `Authorization: Bearer <token>`.
Errors are returned as `{ "message": "..." }` (validation errors also include `errors: [...]`).

---

## Auth

### POST /auth/register
Body: `{ name, username, email, password }`
→ `201 { token, user }`

### POST /auth/login
Body: `{ email, password }`
→ `200 { token, user }`

### GET /auth/me  🔒
→ `200 { user }`

---

## Users

### GET /users/me  🔒
→ `200 { user }`

### PUT /users/me  🔒
Body (any subset): `{ name, headline, bio, avatarUrl, location, links, careerGoal, currentSkills, interestedDomains, skillLevel, isPublicPortfolio }`
→ `200 { user }`

### POST /users/me/onboarding  🔒
Body: `{ careerGoal, currentSkills: string[], interestedDomains: string[], skillLevel }`
→ `200 { user }`

### POST /users/me/skills  🔒
Body: `{ name, source? }`
→ `200 { user }`

### DELETE /users/me/skills/:skillName  🔒
→ `200 { user }`

### GET /users/me/dashboard  🔒
→ `200 { welcomeName, careerGoal, stats, savedCourses, inProgressCourses, completedCourses, skills, certificates, recentActivity }`

### GET /portfolio/:username
Public. → `200 { name, username, headline, bio, location, links, careerGoal, skills, certificates, projects, completedCourses }` or `404` if not found/not public.

---

## Courses

### GET /courses
Query params: `q, skill, platform, category, difficulty, minDuration, maxDuration, certificate, isFree, sort (relevance|popularity|newest|durationAsc|durationDesc), page, limit`
→ `200 { courses, pagination: { page, limit, total, totalPages } }`

### GET /courses/my-learning  🔒
→ `200 { progress }` (each entry populated with its course)

### GET /courses/:id
→ `200 { course }`

### POST /courses/:id/save  🔒
Toggles save/bookmark. → `200 { saved, savedCourses }`

### PUT /courses/:id/progress  🔒
Body: `{ status: 'saved'|'in-progress'|'completed', progressPercent? }`
→ `200 { progress }` — marking `completed` auto-adds the course's skills to the profile.

---

## Certificates  🔒 (all routes)

### GET /certificates → `200 { certificates }`
### POST /certificates
Body: `{ name, issuingOrganization, issueDate, credentialId?, certificateUrl?, relatedSkills? }`
→ `201 { certificate }` — auto-adds `relatedSkills` to the profile.
### PUT /certificates/:id → `200 { certificate }`
### DELETE /certificates/:id → `200 { message }`

---

## Resume  🔒 (all routes)

### GET /resume → `200 { resume }`
### PUT /resume
Body (any subset): `{ template, sectionOrder, personalInfo, summary, education, skills, projects, certifications, experience, achievements, links }`
→ `200 { resume }`
### POST /resume/autofill
Pulls skills + certificates from the profile into the resume. → `200 { resume }`
### GET /resume/ats-score
→ `200 { score, rating, suggestions: string[], disclaimer }`

---

## Recommendations  🔒

### GET /recommendations?limit=10
→ `200 { courses, basis: 'rule-based (career goal + skills + interests + level match)' }`

---

## Categories

### GET /categories → `200 { categories }`
### POST /categories  🔒 admin — Body: `{ name, description?, icon? }` → `201 { category }`
### PUT /categories/:id  🔒 admin → `200 { category }`
### DELETE /categories/:id  🔒 admin — soft-deactivates → `200 { message }`

---

## Admin  🔒 admin (all routes)

### GET /admin/stats
→ `200 { totalUsers, totalCourses, activeCourses, brokenLinks, totalCertificates, completedCourseCount, byPlatform, byCategory }`

### GET /admin/courses
Query: `linkStatus, isActive, page, limit` → `200 { courses, pagination }`

### POST /admin/courses
Body: full course fields (see `models/Course.js`) → `201 { course }`

### PUT /admin/courses/:id → `200 { course }`

### DELETE /admin/courses/:id
Soft-deactivates (`isActive: false`). → `200 { message }`

### PUT /admin/courses/:id/verify
Body: `{ linkStatus: 'active'|'broken' }` → `200 { course }`

### GET /admin/courses-broken
→ `200 { courses }` — all courses currently flagged `broken`.

### GET /admin/users → `200 { users }`

### PUT /admin/users/:id/active
Body: `{ isActive: boolean }` → `200 { user }`

---

## Health check

### GET /api/health
→ `200 { status: 'ok', service: 'skillhub-api', time }`
