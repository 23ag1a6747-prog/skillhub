import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { apiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import CourseCard from '../components/CourseCard';
import ProgressBar from '../components/ProgressBar';

export default function Dashboard() {
  const { user } = useAuth();
  const { notify } = useToast();
  const [dashboard, setDashboard] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/users/me/dashboard'), api.get('/recommendations?limit=6')])
      .then(([dashRes, recRes]) => {
        setDashboard(dashRes.data);
        setRecommended(recRes.data.courses);
      })
      .catch((err) => notify(apiErrorMessage(err), { type: 'error' }))
      .finally(() => setLoading(false));
  }, [notify]);

  if (loading) return <LoadingState label="Loading your dashboard…" />;
  if (!dashboard) return null;

  const { stats } = dashboard;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-ink">Welcome back, {dashboard.welcomeName?.split(' ')[0]}</h1>
      <p className="mt-1 text-sm text-ink-400">
        {dashboard.careerGoal ? `Working toward: ${dashboard.careerGoal}` : 'Set a career goal to get tailored recommendations.'}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Saved" value={stats.savedCourses} />
        <StatCard label="In progress" value={stats.inProgressCourses} />
        <StatCard label="Completed" value={stats.completedCourses} />
        <StatCard label="Skills" value={stats.totalSkills} />
        <StatCard label="Certificates" value={stats.totalCertificates} />
        <StatCard label="Resume" value={`${stats.resumeCompletion}%`} hint="completion" />
      </div>

      {/* Recommended */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Recommended for you</h2>
          <Link to="/courses" className="text-sm font-medium text-signal">
            Browse all
          </Link>
        </div>
        {recommended.length === 0 ? (
          <EmptyState
            title="No recommendations yet"
            description="Complete onboarding with a career goal and a few skills to see tailored suggestions."
          />
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((c) => (
              <CourseCard key={c._id} course={c} />
            ))}
          </div>
        )}
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* In progress */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink">Continue learning</h2>
          {dashboard.inProgressCourses.length === 0 ? (
            <EmptyState title="Nothing in progress" description="Start a saved course to see it here." />
          ) : (
            <div className="mt-4 space-y-3">
              {dashboard.inProgressCourses.map((p) => (
                <Link to={`/courses/${p.course?._id}`} key={p._id} className="card block p-4 hover:border-ink">
                  <p className="font-medium text-ink">{p.course?.title}</p>
                  <div className="mt-2">
                    <ProgressBar percent={p.progressPercent} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Skills & certificates */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink">Your skills</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {dashboard.skills.length === 0 ? (
              <p className="text-sm text-ink-400">No skills yet — add some in onboarding or your profile.</p>
            ) : (
              dashboard.skills.map((s) => (
                <span key={s.name} className="rounded-full border border-line bg-white px-3 py-1 text-sm text-ink-600">
                  {s.name}
                </span>
              ))
            )}
          </div>

          <h2 className="mt-6 font-display text-lg font-semibold text-ink">Recent certificates</h2>
          {dashboard.certificates.length === 0 ? (
            <EmptyState
              title="No certificates yet"
              description="Add one after completing a course."
              action={
                <Link to="/certificates" className="btn-secondary">
                  Add a certificate
                </Link>
              }
            />
          ) : (
            <div className="mt-4 space-y-2">
              {dashboard.certificates.slice(0, 3).map((c) => (
                <div key={c._id} className="card p-4">
                  <p className="font-medium text-ink">{c.name}</p>
                  <p className="text-xs text-ink-400">{c.issuingOrganization}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
