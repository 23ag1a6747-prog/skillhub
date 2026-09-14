import { useEffect, useState } from 'react';
import api, { apiErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import AdminTabs from '../../components/AdminTabs';
import LoadingState from '../../components/LoadingState';

export default function AdminCategories() {
  const { notify } = useToast();
  const [categories, setCategories] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data.categories))
      .catch((err) => notify(apiErrorMessage(err), { type: 'error' }));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/categories', form);
      notify('Category created.', { type: 'success' });
      setForm({ name: '', description: '', icon: '' });
      load();
    } catch (err) {
      notify(apiErrorMessage(err), { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      notify('Category deactivated.', { type: 'success' });
      load();
    } catch (err) {
      notify(apiErrorMessage(err), { type: 'error' });
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-ink">Admin</h1>
      <div className="mt-4">
        <AdminTabs />
      </div>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-6">
        <h2 className="font-display text-base font-semibold text-ink">New category</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input required className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Icon keyword (optional)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
        </div>
        <textarea className="input min-h-[70px]" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Creating…' : 'Create category'}
        </button>
      </form>

      <div className="mt-6">
        {categories === null ? (
          <LoadingState label="Loading categories…" />
        ) : (
          <div className="space-y-2">
            {categories.map((c) => (
              <div key={c._id} className="card flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-ink">{c.name}</p>
                  {c.description && <p className="text-xs text-ink-400">{c.description}</p>}
                </div>
                <button onClick={() => handleDeactivate(c._id)} className="btn-ghost text-xs text-warn hover:bg-warn/5">
                  Deactivate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
