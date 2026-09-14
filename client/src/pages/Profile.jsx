import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { apiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SkillBadge from '../components/SkillBadge';

const CAREER_GOALS = [
  'Data Analyst',
  'Data Scientist',
  'Web Developer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'ML Engineer',
  'Cloud Engineer',
  'UI/UX Designer',
];

export default function Profile() {
  const { user, updateLocalUser } = useAuth();
  const { notify } = useToast();
  const [form, setForm] = useState({
    name: user.name || '',
    headline: user.headline || '',
    bio: user.bio || '',
    location: user.location || '',
    careerGoal: user.careerGoal || '',
    isPublicPortfolio: user.isPublicPortfolio,
    links: user.links || { linkedin: '', github: '', portfolio: '', website: '' },
  });
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/users/me', form);
      updateLocalUser(res.data.user);
      notify('Profile updated.', { type: 'success' });
    } catch (err) {
      notify(apiErrorMessage(err), { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = async (e) => {
    e.preventDefault();
    const name = skillInput.trim();
    if (!name) return;
    try {
      const res = await api.post('/users/me/skills', { name });
      updateLocalUser(res.data.user);
      setSkillInput('');
    } catch (err) {
      notify(apiErrorMessage(err), { type: 'error' });
    }
  };

  const removeSkill = async (name) => {
    try {
      const res = await api.delete(`/users/me/skills/${encodeURIComponent(name)}`);
      updateLocalUser(res.data.user);
    } catch (err) {
      notify(apiErrorMessage(err), { type: 'error' });
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Your profile</h1>
        <Link to={`/portfolio/${user.username}`} className="text-sm font-medium text-signal">
          View public portfolio →
        </Link>
      </div>

      <form onSubmit={handleSave} className="card mt-6 space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="label">Headline</label>
          <input
            className="input"
            value={form.headline}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
            placeholder="Aspiring Data Analyst | Python & SQL"
          />
        </div>

        <div>
          <label className="label">Bio</label>
          <textarea className="input min-h-[80px]" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>

        <div>
          <label className="label">Career goal</label>
          <select className="input" value={form.careerGoal} onChange={(e) => setForm({ ...form, careerGoal: e.target.value })}>
            <option value="">Not set</option>
            {CAREER_GOALS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {['linkedin', 'github', 'portfolio', 'website'].map((key) => (
            <input
              key={key}
              className="input"
              placeholder={key[0].toUpperCase() + key.slice(1) + ' URL'}
              value={form.links?.[key] || ''}
              onChange={(e) => setForm({ ...form, links: { ...form.links, [key]: e.target.value } })}
            />
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={form.isPublicPortfolio}
            onChange={(e) => setForm({ ...form, isPublicPortfolio: e.target.checked })}
          />
          Make my portfolio publicly viewable
        </label>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <div className="card mt-6 p-6">
        <h2 className="font-display text-base font-semibold text-ink">Skills</h2>
        <form onSubmit={addSkill} className="mt-3 flex gap-2">
          <input className="input" placeholder="Add a skill" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} />
          <button type="submit" className="btn-secondary whitespace-nowrap">
            Add
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {(user.currentSkills || []).map((s) => (
            <SkillBadge key={s.name} skill={s} onRemove={removeSkill} />
          ))}
        </div>
      </div>
    </div>
  );
}
