import { useEffect, useState } from 'react';
import api, { apiErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import AdminTabs from '../../components/AdminTabs';
import LoadingState from '../../components/LoadingState';
import StatCard from '../../components/StatCard';

export default function AdminOverview() {
  const { notify } = useToast();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((res) => setStats(res.data))
      .catch((err) => notify(apiErrorMessage(err), { type: 'error' }));
  }, [notify]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-ink">Admin</h1>
      <div className="mt-4">
        <AdminTabs />
      </div>

      <div className="mt-6">
        {!stats ? (
          <LoadingState label="Loading platform stats…" />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatCard label="Users" value={stats.totalUsers} />
              <StatCard label="Total courses" value={stats.totalCourses} />
              <StatCard label="Active courses" value={stats.activeCourses} />
              <StatCard label="Broken links" value={stats.brokenLinks} />
              <StatCard label="Certificates" value={stats.totalCertificates} />
              <StatCard label="Completions" value={stats.completedCourseCount} />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="card p-5">
                <h2 className="font-display text-base font-semibold text-ink">Courses by platform</h2>
                <div className="mt-3 space-y-2">
                  {stats.byPlatform.map((p) => (
                    <div key={p._id} className="flex items-center justify-between text-sm">
                      <span className="text-ink-600">{p._id}</span>
                      <span className="font-medium text-ink">{p.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-5">
                <h2 className="font-display text-base font-semibold text-ink">Courses by category</h2>
                <div className="mt-3 space-y-2">
                  {stats.byCategory.map((c) => (
                    <div key={c._id} className="flex items-center justify-between text-sm">
                      <span className="text-ink-600">{c.name || 'Uncategorized'}</span>
                      <span className="font-medium text-ink">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
