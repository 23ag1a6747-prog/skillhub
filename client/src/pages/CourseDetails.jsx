import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { apiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useOnlineStatus from '../hooks/useOnlineStatus';
import { cacheCourse, getCachedCourse } from '../services/offlineDb';
import PlatformBadge from '../components/PlatformBadge';
import LoadingState from '../components/LoadingState';
import ProgressBar from '../components/ProgressBar';

export default function CourseDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { notify } = useToast();
  const isOnline = useOnlineStatus();

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (!isOnline) throw new Error('offline');
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data.course);
        cacheCourse(res.data.course);
        setFromCache(false);

        if (user) {
          const learning = await api.get('/courses/my-learning');
          const match = learning.data.progress.find((p) => p.course?._id === id);
          if (match) setProgress(match);
          setSaved(user.savedCourses?.some((c) => (c._id || c) === id));
        }
      } catch (err) {
        const cached = await getCachedCourse(id);
        if (cached) {
          setCourse(cached);
          setFromCache(true);
        } else if (isOnline) {
          notify(apiErrorMessage(err), { type: 'error' });
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isOnline, user, notify]);

  const handleSave = async () => {
    if (!user) return notify('Log in to save courses.', { type: 'error' });
    setBusy(true);
    try {
      const res = await api.post(`/courses/${id}/save`);
      setSaved(res.data.saved);
      notify(res.data.saved ? 'Course saved.' : 'Removed from saved.', { type: 'success' });
    } catch (err) {
      notify(apiErrorMessage(err), { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const updateStatus = async (status) => {
    if (!user) return notify('Log in to track progress.', { type: 'error' });
    setBusy(true);
    try {
      const percent = status === 'in-progress' ? Math.max(10, progress?.progressPercent || 10) : status === 'completed' ? 100 : 0;
      const res = await api.put(`/courses/${id}/progress`, { status, progressPercent: percent });
      setProgress(res.data.progress);
      notify(`Marked as ${status.replace('-', ' ')}.`, { type: 'success' });
    } catch (err) {
      notify(apiErrorMessage(err), { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingState label="Loading course…" />;
  if (!course) return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-ink-400">Course not found.</div>;

  const externalCourseUrl = (() => {
    if (course.courseUrl && !course.courseUrl.includes('example.com')) return course.courseUrl;
    const q = encodeURIComponent(`${course.title} ${course.instructor || ''}`.trim());
    if (course.platform === 'YouTube') return `https://www.youtube.com/results?search_query=${q}`;
    if (course.platform === 'Coursera') return `https://www.coursera.org/search?query=${encodeURIComponent(course.title)}`;
    if (course.platform === 'edX') return `https://www.edx.org/search?q=${encodeURIComponent(course.title)}`;
    if (course.platform === 'NPTEL') return 'https://nptel.ac.in/courses';
    return `https://www.google.com/search?q=${q}`;
  })();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {fromCache && (
        <p className="mb-4 rounded-control bg-ink/5 px-3 py-2 text-xs text-ink-400">
          You're offline — showing a previously loaded version of this course.
        </p>
      )}

      <Link to="/courses" className="text-sm text-ink-400 hover:text-ink">
        ← Back to courses
      </Link>

      <div className="mt-4 overflow-hidden rounded-card border border-line">
        <img src={course.thumbnailUrl} alt="" className="h-64 w-full object-cover" />
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <PlatformBadge platform={course.platform} />
          <h1 className="mt-2 font-display text-2xl font-bold text-ink">{course.title}</h1>
          {course.instructor && <p className="mt-1 text-sm text-ink-400">by {course.instructor}</p>}
        </div>
        <a href={externalCourseUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
          Enter course ↗
        </a>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-400">
        <span>{course.difficulty}</span>
        <span>{course.durationHours} hours</span>
        <span>{course.isFree ? 'Free' : 'Paid'}</span>
        {course.hasCertificate && <span className="text-ok">Certificate available</span>}
        <span>Last verified {new Date(course.lastVerified).toLocaleDateString()}</span>
      </div>

      <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-600">{course.description}</p>

      <div className="mt-6 rounded-card border border-line bg-ink/[0.02] p-4">
        <p className="text-sm font-semibold text-ink">External course link</p>
        <p className="mt-1 text-sm text-ink-400">This course is hosted on {course.platform}. Use the button to open the external learning page in a new tab.</p>
        <a href={externalCourseUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-medium text-primary underline underline-offset-2">
          Open {course.platform} ↗
        </a>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(course.skills || []).map((s) => (
          <span key={s} className="rounded-full bg-signal-50 px-3 py-1 text-xs text-signal-600">
            {s}
          </span>
        ))}
      </div>

      {user && (
        <div className="card mt-8 p-5">
          <h2 className="font-display text-base font-semibold text-ink">Your progress</h2>
          {progress && <ProgressBar percent={progress.progressPercent} label={progress.status.replace('-', ' ')} />}
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={handleSave} disabled={busy} className="btn-secondary">
              {saved ? 'Remove from saved' : 'Save course'}
            </button>
            <button onClick={() => updateStatus('in-progress')} disabled={busy} className="btn-secondary">
              Mark in progress
            </button>
            <button onClick={() => updateStatus('completed')} disabled={busy} className="btn-primary">
              Mark completed
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-400">Completing a course automatically adds its skills to your profile.</p>
        </div>
      )}
    </div>
  );
}
