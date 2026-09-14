import { useEffect, useState } from 'react';
import api, { apiErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const EMPTY_FORM = {
  name: '',
  issuingOrganization: '',
  issueDate: '',
  credentialId: '',
  certificateUrl: '',
  relatedSkills: '',
};

export default function Certificates() {
  const { notify } = useToast();
  const [certificates, setCertificates] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api
      .get('/certificates')
      .then((res) => setCertificates(res.data.certificates))
      .catch((err) => notify(apiErrorMessage(err), { type: 'error' }));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (cert) => {
    setForm({
      name: cert.name,
      issuingOrganization: cert.issuingOrganization,
      issueDate: cert.issueDate ? cert.issueDate.slice(0, 10) : '',
      credentialId: cert.credentialId || '',
      certificateUrl: cert.certificateUrl || '',
      relatedSkills: (cert.relatedSkills || []).join(', '),
    });
    setEditingId(cert._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...form,
      relatedSkills: form.relatedSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };
    try {
      if (editingId) {
        await api.put(`/certificates/${editingId}`, payload);
        notify('Certificate updated.', { type: 'success' });
      } else {
        await api.post('/certificates', payload);
        notify('Certificate added — related skills were added to your profile.', { type: 'success' });
      }
      setShowForm(false);
      load();
    } catch (err) {
      notify(apiErrorMessage(err), { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this certificate? This cannot be undone.')) return;
    try {
      await api.delete(`/certificates/${id}`);
      notify('Certificate deleted.', { type: 'success' });
      load();
    } catch (err) {
      notify(apiErrorMessage(err), { type: 'error' });
    }
  };

  if (certificates === null) return <LoadingState label="Loading your certificates…" />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Certificates</h1>
          <p className="mt-1 text-sm text-ink-400">Log what you've earned — it flows straight into your resume.</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          Add certificate
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-6">
          <h2 className="font-display text-base font-semibold text-ink">
            {editingId ? 'Edit certificate' : 'New certificate'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Certificate name</label>
              <input
                required
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Python for Everybody"
              />
            </div>
            <div>
              <label className="label">Issuing organization</label>
              <input
                required
                className="input"
                value={form.issuingOrganization}
                onChange={(e) => setForm({ ...form, issuingOrganization: e.target.value })}
                placeholder="University of Michigan"
              />
            </div>
            <div>
              <label className="label">Issue date</label>
              <input
                required
                type="date"
                className="input"
                value={form.issueDate}
                onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Credential ID (optional)</label>
              <input
                className="input"
                value={form.credentialId}
                onChange={(e) => setForm({ ...form, credentialId: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Certificate URL (optional)</label>
              <input
                className="input"
                value={form.certificateUrl}
                onChange={(e) => setForm({ ...form, certificateUrl: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Related skills (comma-separated)</label>
              <input
                className="input"
                value={form.relatedSkills}
                onChange={(e) => setForm({ ...form, relatedSkills: e.target.value })}
                placeholder="Python, Data Analytics"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Add certificate'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6">
        {certificates.length === 0 && !showForm ? (
          <EmptyState title="No certificates yet" description="Add your first certificate to see it here and on your resume." />
        ) : (
          <div className="space-y-3">
            {certificates.map((c) => (
              <div key={c._id} className="card flex flex-wrap items-start justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-ink">{c.name}</p>
                  <p className="text-sm text-ink-400">{c.issuingOrganization}</p>
                  <p className="mt-1 text-xs text-ink-400">
                    Issued {new Date(c.issueDate).toLocaleDateString()}
                    {c.credentialId ? ` · ID: ${c.credentialId}` : ''}
                  </p>
                  {c.relatedSkills?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {c.relatedSkills.map((s) => (
                        <span key={s} className="rounded-full bg-signal-50 px-2 py-0.5 text-xs text-signal-600">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(c)} className="btn-ghost">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(c._id)} className="btn-ghost text-warn hover:bg-warn/5">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
