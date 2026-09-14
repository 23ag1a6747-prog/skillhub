import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const result = await login(form.email, form.password);
    setSubmitting(false);

    if (result.ok) {
      notify('Logged in successfully.', { type: 'success' });
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-400">Log in to continue your learning and resume.</p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-4 p-6">
        {error && (
          <div className="rounded-control border border-warn/30 bg-warn/5 px-3 py-2 text-sm text-warn">{error}</div>
        )}
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
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
        <p className="text-center text-xs text-ink-400">
          Demo account: aditi@example.com / Password123 (or admin@skillhub.dev / AdminPass123)
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-ink-400">
        New to SkillHub?{' '}
        <Link to="/register" className="font-medium text-signal">
          Create an account
        </Link>
      </p>
    </div>
  );
}
