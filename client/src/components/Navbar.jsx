import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/courses', label: 'Courses' },
  { to: '/my-learning', label: 'My Learning' },
  { to: '/saved-courses', label: 'Saved' },
  { to: '/certificates', label: 'Certificates' },
  { to: '/resume', label: 'Resume' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to={user ? '/dashboard' : '/'} className="font-display text-lg font-bold tracking-tight text-ink">
          SkillHub
        </Link>

        {user && (
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-control px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-ink text-paper' : 'text-ink-600 hover:bg-ink/5'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {user.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `rounded-control px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-ink text-paper' : 'text-ink-600 hover:bg-ink/5'
                  }`
                }
              >
                Admin
              </NavLink>
            )}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/profile" className="hidden text-sm font-medium text-ink-600 hover:text-ink sm:block">
                {user.name?.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="btn-ghost">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>

      {user && (
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-line px-4 py-2 md:hidden">
          {[...navItems, ...(user.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : [])].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-control px-3 py-1.5 text-sm font-medium ${
                  isActive ? 'bg-ink text-paper' : 'text-ink-600'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
