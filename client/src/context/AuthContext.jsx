import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { apiErrorMessage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('skillhub_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('skillhub_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('skillhub_user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem('skillhub_token');
        localStorage.removeItem('skillhub_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = (token, userData) => {
    localStorage.setItem('skillhub_token', token);
    localStorage.setItem('skillhub_user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      persistSession(res.data.token, res.data.user);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: apiErrorMessage(err, 'Invalid email or password.') };
    }
  }, []);

  const register = useCallback(async (payload) => {
    try {
      const res = await api.post('/auth/register', payload);
      persistSession(res.data.token, res.data.user);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: apiErrorMessage(err, 'Could not create your account.') };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('skillhub_token');
    localStorage.removeItem('skillhub_user');
    setUser(null);
  }, []);

  const updateLocalUser = useCallback((partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem('skillhub_user', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateLocalUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
