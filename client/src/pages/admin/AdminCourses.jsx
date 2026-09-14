import { useEffect, useState } from 'react';
import api, { apiErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import AdminTabs from '../../components/AdminTabs';
import LoadingState from '../../components/LoadingState';

const EMPTY_FORM = {
  title: '',
  description: '',
  platform: 'YouTube',
  instructor: '',
  category: '',
  skills: '',
  difficulty: 'Beginner',
  durationHours: '',
  courseUrl: '',
  thumbnailUrl: '',
  isFree: true,
  hasCertificate: false,
};

export default function AdminCourses() {
  const { notify } = useToast();
  const [courses, setCourses] = useState(null);
  const [categories, setCategories] = useState([]);
  const [linkStatusFilter, setLinkStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    const params = linkStatusFilter ? { linkStatus: linkStatusFilter, limit: 50 } : { limit: 50 };
    api
      .get('/admin/courses', { params })
      .then((res) => setCourses(res.data.courses))
      .catch((err) => notify(apiErrorMessage(err), { type: 'error' }));
  };

  useEffect(load, [linkStatusFilter]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories));
  }, []);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (course) => {
    setForm({
      title: course.title,
      description: course.description,
      platform: course.platform,
      instructor: course.instructor || '',
      category: course.category?._id || '',
      skills: (course.skills || []).join(', '),
      difficulty: course.difficulty,
      durationHours: course.durationHours,
      courseUrl: course.courseUrl,
      thumbnailUrl: course.thumbnailUrl || '',
      isFree: course.isFree,
      hasCertificate: course.hasCertificate,
    });
    setEditingId(course._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...form,
      durationHours: Number(form.durationHours),
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await api.put(`/admin/courses/${editingId}`, payload);
        notify('Course updated.', { type: 'success' });
      } else {
        await api.post('/admin/courses', payload);
        notify('Course created.', { type: 'success' });
      }
      setShowForm(false);
      load();
    } catch (err) {
      notify(apiErrorMessage(err), { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (id, linkStatus) => {
    try {
      await api.put(`/admin/courses/${id}/verify`, { linkStatus });
      notify(`Marked link as ${linkStatus}.`, { type: 'success' });
      load();
    } catch (err) {
      notify(apiErrorMessage(err), { type: 'error' });
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this course? It will be hidden from students.')) return;
    try {
      await api.delete(`/admin/courses/${id}`);
      notify('Course deactivated.', { type: 'success' });
      load();
    } catch (err) {
      notify(apiErrorMessage(err), { type: 'error' });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-ink">Admin</h1>
      <div className="mt-4">
        <AdminTabs />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <select className="input max-w-[220px]" value={linkStatusFilter} onChange={(e) => setLinkStatusFilter(e.target.value)}>
          <option value="">All link statuses</option>
          <option value="active">Active</option>
          <option value="unverified">Unverified</option>
          <option value="broken">Broken</option>
        </select>
        <button onClick={openNew} className="btn-primary">
          Add course
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mt-5 space-y-4 p-6">
          <h2 className="font-display text-base font-semibold text-ink">{editingId ? 'Edit course' : 'New course'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input required className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <select className="input" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
              {['YouTube', 'NPTEL', 'Coursera', 'edX', 'Other'].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <input className="input" placeholder="Instructor" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} />
            <select required className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              {['Beginner', 'Intermediate', 'Advanced'].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <input required type="number" min="1" className="input" placeholder="Duration (hours)" value={form.durationHours} onChange={(e) => setForm({ ...form, durationHours: e.target.value })} />
            <input required className="input sm:col-span-2" placeholder="Course URL" value={form.courseUrl} onChange={(e) => setForm({ ...form, courseUrl: e.target.value })} />
            <input className="input sm:col-span-2" placeholder="Thumbnail URL" value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} />
            <input className="input sm:col-span-2" placeholder="Skills (comma-separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
            <textarea required className="input sm:col-span-2 min-h-[80px]" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <label className="flex items-center gap-2 text-sm text-ink-600">
              <input type="checkbox" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} />
              Free
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-600">
              <input type="checkbox" checked={form.hasCertificate} onChange={(e) => setForm({ ...form, hasCertificate: e.target.checked })} />
              Certificate available
            </label>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Create course'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6">
        {courses === null ? (
          <LoadingState label="Loading courses…" />
        ) : (
          <div className="overflow-x-auto rounded-card border border-line bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-ink/[0.02] text-left text-xs text-ink-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Title</th>
                  <th className="px-4 py-2 font-medium">Platform</th>
                  <th className="px-4 py-2 font-medium">Link status</th>
                  <th className="px-4 py-2 font-medium">Active</th>
                  <th className="px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c._id} className="border-b border-line last:border-0">
                    <td className="max-w-xs truncate px-4 py-2 font-medium text-ink">{c.title}</td>
                    <td className="px-4 py-2 text-ink-600">{c.platform}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          c.linkStatus === 'active'
                            ? 'bg-ok/10 text-ok'
                            : c.linkStatus === 'broken'
                            ? 'bg-warn/10 text-warn'
                            : 'bg-ink/5 text-ink-400'
                        }`}
                      >
                        {c.linkStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-ink-600">{c.isActive ? 'Yes' : 'No'}</td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <button onClick={() => openEdit(c)} className="btn-ghost px-2 py-1 text-xs">
                        Edit
                      </button>
                      <button onClick={() => handleVerify(c._id, 'active')} className="btn-ghost px-2 py-1 text-xs text-ok">
                        Mark active
                      </button>
                      <button onClick={() => handleVerify(c._id, 'broken')} className="btn-ghost px-2 py-1 text-xs text-warn">
                        Mark broken
                      </button>
                      <button onClick={() => handleDeactivate(c._id)} className="btn-ghost px-2 py-1 text-xs text-ink-400">
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
