import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { apiErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ProgressBar from '../components/ProgressBar';
import PlatformBadge from '../components/PlatformBadge';

const TABS = [
  { key: 'saved', label: 'Saved' },
  { key: 'in-progress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
];

export default function MyLearning() {
  const { notify } = useToast();
  const [progress, setProgress] = useState(null);
  const [tab, setTab] = useState('in-progress');

  useEffect(() => {
    api
      .get('/courses/my-learning')
      .then((res) => setProgress(res.data.progress))
      .catch((err) => notify(apiErrorMessage(err), { type: 'error' }));
  }, [notify]);

  if (progress === null) return <LoadingState label="Loading your learning…" />;

  const filtered = progress.filter((p) => p.status === tab && p.course);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-ink">My learning</h1>
      <p className="mt-1 text-sm text-ink-400">Everything you've saved, started, or finished.</p>

      <div className="mt-6 flex gap-2 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
              tab === t.key ? 'border-ink text-ink' : 'border-transparent text-ink-400 hover:text-ink'
            }`}
          >
            {t.label} ({progress.filter((p) => p.status === t.key && p.course).length})
          </button>
        ))}
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState
            title={`Nothing ${tab.replace('-', ' ')} yet`}
            description="Find a course and update its status from the course page."
            action={
              <Link to="/courses" className="btn-primary">
                Browse courses
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <Link key={p._id} to={`/courses/${p.course._id}`} className="card flex items-center gap-4 p-4 hover:border-ink">
                <img
                  src={p.course.thumbnailUrl}
                  alt=""
                  className="h-16 w-24 flex-shrink-0 rounded-control object-cover bg-ink/5"
                />
                <div className="min-w-0 flex-1">
                  <PlatformBadge platform={p.course.platform} />
                  <p className="mt-0.5 truncate font-medium text-ink">{p.course.title}</p>
                  {tab === 'in-progress' && <ProgressBar percent={p.progressPercent} />}
                  {tab === 'completed' && (
                    <p className="text-xs text-ink-400">
                      Completed {p.completedAt ? new Date(p.completedAt).toLocaleDateString() : ''}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
