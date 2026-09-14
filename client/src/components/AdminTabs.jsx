import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/courses', label: 'Courses' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/categories', label: 'Categories' },
];

export default function AdminTabs() {
  return (
    <div className="flex gap-1 border-b border-line">
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            `-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
              isActive ? 'border-ink text-ink' : 'border-transparent text-ink-400 hover:text-ink'
            }`
          }
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  );
}
