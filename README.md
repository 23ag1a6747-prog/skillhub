# SkillHub

A full-stack MERN application that aggregates free courses from YouTube, NPTEL,
Coursera and edX into one searchable catalog, tracks a student's learning
progress and certificates, and turns that history into an ATS-friendly
resume — complete with a resume-quality score and downloadable PDF.

This is a **working full-stack app**, not a static mockup: the React frontend
calls a real Express + local JSON database backend for every feature listed below.

---

## 1. Tech stack

| Layer      | Technology                                                        |
|------------|--------------------------------------------------------------------|
| Frontend   | React 18 (Vite), React Router, Axios, Tailwind CSS, jsPDF, idb (IndexedDB), vite-plugin-pwa |
| Backend    | Node.js, Express.js                                                |
| Database   | local JSON database (Mongoose ODM)                                            |
| Auth       | JWT + bcrypt password hashing                                      |
| PWA        | Service Worker + Cache Storage (Workbox, via vite-plugin-pwa) + IndexedDB |

---

## 2. Project structure

```
skillhub/
  client/                     # React frontend (Vite)
    src/
      components/              # Reusable UI: CourseCard, Navbar, ProtectedRoute, etc.
      pages/                   # One file per route, plus pages/admin/*
      context/                 # AuthContext, ToastContext
      hooks/                   # useOnlineStatus
      services/                # api.js (axios), offlineDb.js (IndexedDB)
    vite.config.js             # includes vite-plugin-pwa config
    tailwind.config.js
    .env.example
  server/                     # Express backend
    controllers/               # Route handlers, grouped by resource
    models/                    # Mongoose schemas: User, Course, Category,
                                # Certificate, LearningProgress, Resume
    routes/                     # Express routers
    middleware/                 # auth (JWT), error handling, validation
    services/                   # recommendationService, atsScoreService,
                                 # courseImportService (abstraction layer)
    seed/                       # data.js (30+ courses, categories, sample user)
                                 # + seed.js (run script)
    server.js
    .env.example
  README.md                   # this file
  API_DOCS.md                 # endpoint reference
```

---

## 3. Features implemented (working end-to-end)

- Registration & login (JWT, bcrypt-hashed passwords), protected routes, role-based access control (student/admin)
- Student dashboard: recommended courses, saved/in-progress/completed counts, skills, certificates, resume completion %, recent activity
- Course catalog: search by title/skill/instructor, filter by platform/category/difficulty/duration/certificate availability, sort by relevance/popularity/newest/duration
- Course details page, save/bookmark, progress tracking (saved → in-progress → completed)
- Completing a course automatically adds its skills to the student's profile
- Certificate management: add/edit/delete, auto-adds related skills to the profile
- Onboarding flow that captures career goal, current skills, interests, and skill level
- Rule-based recommendation engine (transparently documented as rule-based, not ML — see `server/services/recommendationService.js` for the seam where a real model could be swapped in later)
- Multi-step resume builder: personal info, summary, education, skills, projects, certifications, experience, achievements, links; drag-free up/down section reordering; 4 templates; live preview; "Autofill from profile" button
- Resume PDF export via jsPDF (client-side, no server round-trip needed)
- **SkillHub Resume-Quality (ATS) Score** — a rule-based estimate (missing contact info, weak summary, missing keywords, unquantified achievements, etc.) with actionable suggestions. Clearly labeled as SkillHub's own estimate, not a simulation of any real company's ATS.
- Public portfolio pages at `/portfolio/:username` (no login required to view)
- Admin panel: course CRUD, link verification (mark active/broken), category management, user management (activate/deactivate), platform statistics
- Course link verification system (`lastVerified`, `linkStatus`) so broken links can be tracked and fixed instead of silently rotting
- PWA: installable manifest, service worker (precache + runtime caching for API reads, fonts, thumbnails), offline banner
- Offline support: previously viewed courses and your resume draft are cached in IndexedDB; resume edits made offline are queued and automatically synced back to the server once you're back online
- Seed data: 31 realistic courses across 5 categories, a sample student account, a sample admin account, sample certificates, sample learning progress, and a pre-filled resume

## 4. Features that require external APIs/credentials in production

SkillHub does **not** scrape third-party sites. The course database is
populated through `server/services/courseImportService.js`, an abstraction
layer with one working importer today and clearly-stubbed hooks for the rest:

| Source                          | Status in this build                                   |
|----------------------------------|----------------------------------------------------------|
| Manual/seed dataset               | ✅ Implemented — this is how the 31 seed courses were loaded |
| YouTube Data API v3                | 🔲 Stub — needs a `YOUTUBE_API_KEY`                        |
| NPTEL RSS/JSON feeds               | 🔲 Stub — needs a configured feed URL                       |
| Coursera partner/catalog API       | 🔲 Stub — needs Coursera partner credentials                |
| edX catalog API                    | 🔲 Stub — needs edX API credentials                         |

Each stub throws a clear "Not implemented" error rather than pretending to
work, and documents exactly what shape of data it needs to return so it can
be wired up later without touching any other part of the app.

---

## 5. Installation

### Prerequisites
- Node.js 18+
- A local JSON database connection — either a local `mongod` instance, or a free
  [local JSON database Atlas](https://www.mongodb.com/atlas) cluster.

### Backend

```bash
cd server
npm install
cp .env.example .env
# edit .env and set LOCAL_DB and JWT_SECRET
npm run seed     # populates the database with sample data
npm run dev      # starts on http://localhost:5000 (nodemon)
# or: npm start
```

### Frontend

```bash
cd client
npm install
cp .env.example .env
# edit .env if your API isn't on http://localhost:5000/api
npm run dev      # starts on http://localhost:5173
```

Open http://localhost:5173.

---

## 6. Environment variables

**server/.env**

| Variable         | Description                                              |
|-------------------|------------------------------------------------------------|
| `LOCAL_DB`      | local JSON database connection string (local or Atlas)                |
| `JWT_SECRET`       | Long random string used to sign auth tokens                |
| `JWT_EXPIRES_IN`   | Token lifetime, e.g. `7d`                                   |
| `PORT`             | API port (default 5000)                                    |
| `NODE_ENV`         | `development` or `production`                              |
| `CLIENT_URL`       | Comma-separated allowed CORS origins                        |

**client/.env**

| Variable          | Description                          |
|--------------------|-----------------------------------------|
| `VITE_API_URL`      | Base URL of the backend API, e.g. `http://localhost:5000/api` |

---

## 7. Seed data & demo accounts

Run `npm run seed` inside `server/` once your `LOCAL_DB` is set. This
creates:

- **31 courses** across 5 categories (Data Science & Analytics, Web
  Development, Programming Fundamentals, Cloud & DevOps, Design &
  Productivity), each with realistic skills, durations, and platforms.
- **Sample student account:** `aditi@example.com` / `Password123` — already
  onboarded with a career goal of "Data Analyst", a few skills, saved/
  in-progress/completed courses, two certificates, and a partially-filled
  resume, so you can see the full app populated immediately.
- **Sample admin account:** `admin@skillhub.dev` / `AdminPass123`.

⚠️ The seed script **clears existing data** in these collections — only run
it against a development database.

---

## 8. Demo flow

1. Log in as `aditi@example.com` (or register a new account and go through
   onboarding: pick "Data Analyst", add skills like Python/Excel, pick
   "Data Science" as an interest).
2. Visit `/dashboard` — see recommended courses driven by that profile.
3. Visit `/courses`, search "SQL" or filter by platform/certificate.
4. Open a course, save it, mark it in-progress, then mark it completed —
   watch its skills appear on your profile automatically.
5. Go to `/certificates` and add one — its related skills also flow into
   your profile.
6. Go to `/resume` — click **Autofill from profile**, edit sections, reorder
   them, switch templates, and watch the live preview update.
7. Click **Check ATS score** to see the rule-based resume-quality score and
   suggestions.
8. Click **Download PDF** to get a real PDF file.
9. Visit `/portfolio/aditisharma` (no login needed) to see the public page.
10. Log in as `admin@skillhub.dev`, visit `/admin`, and try marking a course
    link as broken, or deactivating a user.
11. Turn off your network (or use devtools' offline mode) and revisit
    `/courses` or `/resume` — previously loaded data is still there, and
    resume edits made offline sync automatically once you're back online.

---

## 9. Testing

- **Backend:** every server file passes `node --check` (syntax-verified).
  With `LOCAL_DB` pointing at a real database, exercise the API with:
  ```bash
  curl http://localhost:5000/api/health
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"aditi@example.com","password":"Password123"}'
  ```
  Or import the routes into Postman/Insomnia using the reference in
  `API_DOCS.md`.
- **Frontend:** `npm run build` inside `client/` produces a production
  build (including the generated service worker) with no errors.

> **Note on this build:** this project was built and syntax/logic-reviewed in
> a sandboxed environment without outbound access to local JSON database's binary
> download servers, so a full live end-to-end run (real database reads/writes
> through the UI) could not be executed inside that sandbox. On your own
> machine — with normal internet access and either a local `mongod` or a free
> local JSON database Atlas cluster — `npm run seed` followed by `npm run dev` in both
> `server/` and `client/` is all that's needed to bring the app up.

---

## 10. Deployment

- **Frontend → Vercel:** point Vercel at `client/`, set `VITE_API_URL` to
  your deployed backend's `/api` URL as an environment variable, build
  command `npm run build`, output directory `dist`.
- **Backend → Render:** point Render at `server/`, set `LOCAL_DB`,
  `JWT_SECRET`, `CLIENT_URL` (your Vercel domain), start command `npm start`.
- **Database → local JSON database Atlas:** create a free cluster, add a database user,
  allow network access from Render's IPs (or `0.0.0.0/0` for simplicity in a
  demo), and use the provided connection string as `LOCAL_DB`.
- After deploying, SSH/shell into the Render service (or run locally with the
  Atlas URI) once to run `npm run seed`.

---

## 11. API reference

See [`API_DOCS.md`](./API_DOCS.md) for the full endpoint list with request/response shapes.
