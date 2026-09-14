import { useEffect, useState } from 'react';
import api, { apiErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import AdminTabs from '../../components/AdminTabs';
import LoadingState from '../../components/LoadingState';

export default function AdminUsers() {
  const { notify } = useToast();
  const [users, setUsers] = useState(null);

  const load = () => {
    api
      .get('/admin/users')
      .then((res) => setUsers(res.data.users))
      .catch((err) => notify(apiErrorMessage(err), { type: 'error' }));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleActive = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}/active`, { isActive: !user.isActive });
      notify(`User ${user.isActive ? 'deactivated' : 'reactivated'}.`, { type: 'success' });
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

      <div className="mt-6">
        {users === null ? (
          <LoadingState label="Loading users…" />
        ) : (
          <div className="overflow-x-auto rounded-card border border-line bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-ink/[0.02] text-left text-xs text-ink-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Role</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-line last:border-0">
                    <td className="px-4 py-2 font-medium text-ink">{u.name}</td>
                    <td className="px-4 py-2 text-ink-600">{u.email}</td>
                    <td className="px-4 py-2 text-ink-600 capitalize">{u.role}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${u.isActive ? 'bg-ok/10 text-ok' : 'bg-warn/10 text-warn'}`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button onClick={() => toggleActive(u)} className="btn-ghost px-2 py-1 text-xs">
                        {u.isActive ? 'Deactivate' : 'Reactivate'}
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
