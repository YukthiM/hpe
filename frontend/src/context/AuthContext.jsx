import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const syncFromToken = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (!token) {
        if (!cancelled) setUser(null);
        return;
      }

      if (savedUser && !cancelled) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          // ignore parse errors; we'll correct from /me below
        }
      }

      try {
        const { data } = await authAPI.getMe();
        if (cancelled) return;
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch {
        if (!cancelled) logout();
      }
    };

    const init = async () => {
      await syncFromToken();
      if (!cancelled) setLoading(false);
    };

    const onStorage = (e) => {
      if (e.key !== 'token' && e.key !== 'user') return;
      setLoading(true);
      syncFromToken().finally(() => {
        if (!cancelled) setLoading(false);
      });
    };

    window.addEventListener('storage', onStorage);
    init();

    return () => {
      cancelled = true;
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      console.error('Refresh user failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
