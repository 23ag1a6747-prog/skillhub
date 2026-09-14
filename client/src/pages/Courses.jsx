import { useCallback, useEffect, useMemo, useState } from 'react';
import api, { apiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useOnlineStatus from '../hooks/useOnlineStatus';
import { cacheCourseList, getCachedCourseList } from '../services/offlineDb';
import CourseFilters from '../components/CourseFilters';
import CourseCard from '../components/CourseCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const DEFAULT_FILTERS = {
  q: '',
  platform: '',
  category: '',
  difficulty: '',
  certificate: '',
  maxDuration: '',
  sort: 'relevance',
};

export default function Courses() {
  const { user } = useAuth();
  const { notify } = useToast();
  const isOnline = useOnlineStatus();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [debouncedQ, setDebouncedQ] = useState('');
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(filters.q), 350);
    return () => clearTimeout(t);
  }, [filters.q]);

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data.categories))
      .catch(() => {});
  }, []);

  const cacheKey = useMemo(() => JSON.stringify({ ...filters, q: debouncedQ }), [filters, debouncedQ]);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const params = { ...filters, q: debouncedQ, page: 1, limit: 12 };
    Object.keys(params).forEach((k) => params[k] === '' && delete params[k]);

    try {
      if (!isOnline) throw new Error('offline');
      const res = await api.get('/courses', { params });
      setCourses(res.data.courses);
      setPagination(res.data.pagination);
      setFromCache(false);
      cacheCourseList(cacheKey, res.data.courses);
    } catch (err) {
      const cached = await getCachedCourseList(cacheKey);
      if (cached) {
        setCourses(cached.courses);
        setFromCache(true);
      } else {
        setCourses([]);
        if (isOnline) notify(apiErrorMessage(err), { type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedQ, isOnline, cacheKey, notify]);

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, filters.platform, filters.category, filters.difficulty, filters.certificate, filters.maxDuration, filters.sort, isOnline]);

  const [savedIds, setSavedIds] = useState(new Set(user?.savedCourses?.map((c) => c._id || c) || []));

  const handleToggleSave = async (course) => {
    if (!isOnline) {
      notify('Saving courses requires an internet connection.', { type: 'error' });
      return;
    }
    setSavingId(course._id);
    try {
      const res = await api.post(`/courses/${course._id}/save`);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (res.data.saved) next.add(course._id);
        else next.delete(course._id);
        return next;
      });
      notify(res.data.saved ? 'Course saved.' : 'Removed from saved courses.', { type: 'success' });
    } catch (err) {
      notify(apiErrorMessage(err), { type: 'error' });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-ink">Explore free courses</h1>
      <p className="mt-1 text-sm text-ink-400">
        {pagination.total ? `${pagination.total} courses across YouTube, NPTEL, Coursera and edX` : 'Search across all our sources'}
      </p>
      {fromCache && (
        <p className="mt-2 rounded-control bg-ink/5 px-3 py-2 text-xs text-ink-400">
          You're offline — showing previously loaded results.
        </p>
      )}

      <div className="mt-6">
        <CourseFilters filters={filters} onChange={setFilters} categories={categories} />
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingState label="Finding courses…" />
        ) : courses.length === 0 ? (
          <EmptyState title="No courses matched your filters" description="Try clearing a filter or searching a different skill." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard
                key={c._id}
                course={c}
                isSaved={savedIds.has(c._id)}
                saving={savingId === c._id}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
