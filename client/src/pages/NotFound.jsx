import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-display text-5xl font-bold text-ink">404</p>
      <h1 className="mt-3 text-lg font-semibold text-ink">This page doesn't exist</h1>
      <p className="mt-1 text-sm text-ink-400">Check the address, or head back to something useful.</p>
      <Link to="/" className="btn-primary mt-6">
        Back to home
      </Link>
    </div>
  );
}
