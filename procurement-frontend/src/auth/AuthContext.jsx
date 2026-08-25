import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { setToken, clearToken, getToken, getExpiresAt, onTokenExpired } from './tokenStore';

const AuthContext = createContext(null);
const STORAGE_KEY = 'eps.auth.user';

function loadStoredUser() {
  // A stored identity is only valid if its token is too - getToken() already
  // self-clears an expired token, so use that as the source of truth.
  if (!getToken()) {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);
  const expiryTimer = useRef(null);

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    if (expiryTimer.current) {
      clearTimeout(expiryTimer.current);
      expiryTimer.current = null;
    }
  }, []);

  const scheduleAutoLogout = useCallback((expiresAt) => {
    if (expiryTimer.current) clearTimeout(expiryTimer.current);
    const delay = expiresAt - Date.now();
    if (delay <= 0) {
      logout();
      return;
    }
    expiryTimer.current = setTimeout(logout, delay);
  }, [logout]);

  // Register once so the plain-JS API client can trigger a logout on a 401
  // without needing to know anything about React state.
  useEffect(() => {
    onTokenExpired(() => {
      clearToken();
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    });
  }, []);

  // Re-arm the auto-logout timer for a session restored from localStorage
  // (e.g. the page was refreshed partway through the 3-hour window).
  useEffect(() => {
    if (user) {
      const expiresAt = getExpiresAt();
      if (expiresAt) scheduleAutoLogout(expiresAt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (username, password) => {
    const result = await api.post('/api/auth/login', { username, password });
    const { token, expiresAt, ...identity } = result;

    setToken(token, expiresAt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
    setUser(identity);
    scheduleAutoLogout(expiresAt);

    return identity;
  }, [scheduleAutoLogout]);

  const hasRole = useCallback(
    (...roles) => !!user && roles.some((r) => user.roles?.includes(r)),
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}
