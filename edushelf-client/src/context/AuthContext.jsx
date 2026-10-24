import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem('edushelf_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('edushelf_token');
      // No token saved — just show the app immediately
      if (!storedToken) {
        setLoading(false);
        return;
      }
      // Token exists — try to verify with backend
      try {
        const res = await getMe();
        setUser(res.data.user || res.data);
        setToken(storedToken);
      } catch {
        // Backend not running OR token expired — clear and continue
        localStorage.removeItem('edushelf_token');
        localStorage.removeItem('edushelf_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('edushelf_token', authToken);
    localStorage.setItem('edushelf_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('edushelf_token');
    localStorage.removeItem('edushelf_user');
  };

  // Merge changes into the logged-in user (e.g. savedBooks) without a full re-login
  const updateUser = (fn) => setUser((u) => {
    const next = fn(u);
    localStorage.setItem('edushelf_user', JSON.stringify(next));
    return next;
  });

  const isAdmin   = user?.role === 'admin';
  const isFaculty = user?.role === 'faculty' || isAdmin;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading, isAdmin, isFaculty }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
