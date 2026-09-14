import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PLATFORMS = ['YouTube', 'NPTEL', 'Coursera', 'edX'];

const STEPS = [
  {
    title: 'Tell us your goal',
    body: 'Pick a career goal like Data Analyst, and the skills and interests you already have.',
  },
  {
    title: 'Learn from one place',
    body: 'Search and filter free courses pulled from YouTube, NPTEL, Coursera and edX, with verified links.',
  },
  {
    title: 'Track every certificate',
    body: 'Log certificates as you earn them — skills get added to your profile automatically.',
  },
  {
    title: 'Leave with a resume',
    body: 'Your courses, skills and certificates flow straight into an ATS-friendly resume, with a quality score.',
  },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line bg-ink text-paper">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <p className="text-sm font-medium text-ember">For students learning on their own</p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-[1.1] sm:text-5xl">
              Free courses, scattered everywhere. Your resume, in one place.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-paper/70">
              SkillHub pulls free courses from YouTube, NPTEL, Coursera and edX into one searchable catalog, then
              turns what you learn into a resume that's ready to send.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to={user ? '/dashboard' : '/register'} className="rounded-control bg-ember px-6 py-3 text-sm font-semibold text-white transition hover:bg-ember/90">
                {user ? 'Go to your dashboard' : 'Start learning free'}
              </Link>
              <Link to="/courses" className="rounded-control border border-paper/30 px-6 py-3 text-sm font-semibold text-paper transition hover:border-paper">
                Browse courses
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-4 text-xs text-paper/50">
              <span>Course sources:</span>
              {PLATFORMS.map((p) => (
                <span key={p}>{p}</span>
              ))}
            </div>
          </div>

          <div className="rounded-card border border-paper/15 bg-paper/[0.04] p-5">
            <p className="mb-3 text-xs font-medium text-paper/50">Sample search</p>
            <div className="rounded-control border border-paper/15 bg-paper/[0.06] px-4 py-3 text-sm text-paper/80">
              Data Analyst → Python, SQL, Power BI, Statistics
            </div>
            <div className="mt-4 space-y-3">
              {[
                { t: 'SQL for Data Science', p: 'Coursera', d: '18h · Certificate' },
                { t: 'Power BI for Beginners', p: 'YouTube', d: '10h · Free' },
                { t: 'NPTEL: Data Science for Engineers', p: 'NPTEL', d: '45h · Certificate' },
              ].map((c) => (
                <div key={c.t} className="flex items-center justify-between rounded-control bg-paper/[0.06] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-paper">{c.t}</p>
                    <p className="text-xs text-paper/50">
                      {c.p} · {c.d}
                    </p>
                  </div>
                  <span className="text-xs text-ember">Match</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-ink">How SkillHub works</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="card p-5">
              <p className="font-display text-sm font-semibold text-signal">{`0${i + 1}`}</p>
              <h3 className="mt-2 font-display text-base font-semibold text-ink">{step.title}</h3>
              <p className="mt-1.5 text-sm text-ink-400">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust / verification */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">Every course is checked, not scraped.</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-400">
                We don't scrape third-party sites. Courses come from official APIs, permitted feeds, curated
                datasets, and manual review — each with a last-verified date, and an admin process for flagging
                broken links.
              </p>
            </div>
            <div className="card p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink">SQL for Data Science</span>
                <span className="text-ok">Verified</span>
              </div>
              <p className="mt-1 text-xs text-ink-400">Last verified 3 days ago · Coursera</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
          <h2 className="font-display text-2xl font-bold text-ink">Ready to turn learning into a resume?</h2>
          <Link to={user ? '/dashboard' : '/register'} className="btn-primary mt-6 inline-flex">
            {user ? 'Go to your dashboard' : 'Create your free account'}
          </Link>
        </div>
      </section>
    </div>
  );
}
