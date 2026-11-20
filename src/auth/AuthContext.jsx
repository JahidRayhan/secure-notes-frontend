import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore, setUnauthorizedHandler } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(tokenStore.get()));
  const [sessionExpired, setSessionExpired] = useState(false);

  // Client already cleared the token; drop the user so route guards redirect to /login.
  useEffect(() => {
    setUnauthorizedHandler(() => { setUser(null); setSessionExpired(true); });
    return () => setUnauthorizedHandler(null);
  }, []);

  // Restore session from stored token.
  useEffect(() => {
    if (!tokenStore.get()) return;
    let cancelled = false;
    api.get('/auth/me')
      .then((u) => { if (!cancelled) setUser(u); })
      .catch(() => { /* 401 handled by client; other errors leave user null */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const startSession = useCallback(({ token, user: u }) => {
    tokenStore.set(token);
    setSessionExpired(false);
    setUser(u);
    return u;
  }, []);

  const login = useCallback(async (email, password) =>
    startSession(await api.post('/auth/login', { email, password })), [startSession]);

  const register = useCallback(async (payload) =>
    startSession(await api.post('/auth/register', payload)), [startSession]);

  const logout = useCallback(() => { tokenStore.clear(); setUser(null); }, []);

  const updateProfile = useCallback(async (payload) => {
    const u = await api.put('/auth/me', payload);
    setUser(u);
    return u;
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    sessionExpired,
    login, register, logout, updateProfile,
  }), [user, loading, sessionExpired, login, register, logout, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
