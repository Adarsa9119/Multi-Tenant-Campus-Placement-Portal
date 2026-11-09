import { useCallback, useEffect, useMemo, useState } from 'react';
import AuthContext from './AuthContext.jsx';
import { authStorage } from './authStorage.js';
import { authApi } from '../api/authApi.js';

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authStorage.get());
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => { authStorage.clear(); setSession(null); }, []);
  const login = useCallback((token, user) => { const s = { token, user }; authStorage.set(s); setSession(s); }, []);
  const refresh = useCallback(async () => {
    const res = await authApi.me();
    const next = { token: authStorage.token(), user: res.data };
    authStorage.set(next);
    setSession(next);
  }, []);

  useEffect(() => {
    const onLogout = () => logout();
    window.addEventListener('cp:logout', onLogout);
    if (authStorage.token()) refresh().catch(logout).finally(() => setReady(true));
    else setReady(true);
    return () => window.removeEventListener('cp:logout', onLogout);
  }, [logout, refresh]);

  const value = useMemo(() => ({ user: session?.user || null, token: session?.token || null, ready, login, logout, refresh }), [session, ready, login, logout, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
