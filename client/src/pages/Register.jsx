import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const { register } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const result = await register(form);
    setSubmitting(false);

    if (result.ok) {
      notify('Account created — let’s set up your profile.', { type: 'success' });
      navigate('/onboarding', { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-ink">Create your account</h1>
      <p className="mt-1 text-sm text-ink-400">Free forever. No credit card, no catch.</p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-4 p-6">
        {error && (
          <div className="rounded-control border border-warn/30 bg-warn/5 px-3 py-2 text-sm text-warn">{error}</div>
        )}
        <div>
          <label className="label" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            required
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Jordan Lee"
          />
        </div>
        <div>
          <label className="label" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            required
            minLength={3}
            className="input"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
            placeholder="jordanlee"
          />
          <p className="mt-1 text-xs text-ink-400">Used for your public portfolio: skillhub.app/portfolio/{form.username || 'username'}</p>
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 6 characters"
          />
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-signal">
          Log in
        </Link>
      </p>
    </div>
  );
}
