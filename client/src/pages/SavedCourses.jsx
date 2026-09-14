import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api, { apiErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import CourseCard from '../components/CourseCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

export default function SavedCourses() {
  const { notify } = useToast();
  const [courses, setCourses] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(() => {
    api
      .get('/users/me/dashboard')
      .then((res) => setCourses(res.data.savedCourses || []))
      .catch((err) => notify(apiErrorMessage(err), { type: 'error' }));
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleSave = async (course) => {
    setSavingId(course._id);
    try {
      await api.post(`/courses/${course._id}/save`);
      setCourses((prev) => prev.filter((c) => c._id !== course._id));
      notify('Removed from saved courses.', { type: 'success' });
    } catch (err) {
      notify(apiErrorMessage(err), { type: 'error' });
    } finally {
      setSavingId(null);
    }
  };

  if (courses === null) return <LoadingState label="Loading your saved courses…" />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-ink">Saved courses</h1>
      <p className="mt-1 text-sm text-ink-400">Courses you've bookmarked to start later.</p>

      <div className="mt-6">
        {courses.length === 0 ? (
          <EmptyState
            title="No saved courses yet"
            description="Browse the catalog and tap Save on anything you want to come back to."
            action={
              <Link to="/courses" className="btn-primary">
                Browse courses
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c._id} course={c} isSaved saving={savingId === c._id} onToggleSave={handleToggleSave} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
