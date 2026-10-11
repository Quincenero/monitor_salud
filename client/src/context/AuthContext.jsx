import { createContext, useCallback, useEffect, useState } from 'react';
import { api, setUnauthorizedHandler } from '../utils/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap: al montar, chequear si ya hay sesión
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // allowUnauthorized: el 401 acá es esperado si no hay sesión
        const data = await api('/api/auth/me', { allowUnauthorized: true });
        if (!cancelled) setUser(data.user);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Registrar handler global de 401:
  // si cualquier request devuelve 401 (sesión expirada, invalidada
  // desde otro dispositivo, etc.), limpiamos el usuario y App.jsx
  // reacciona mandando a /login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setUser(data.user);
    return data.user;
  }, []);

    const register = useCallback(async (name, email, password) => {
    const data = await api('/api/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
    // Ya NO seteamos el user: primero tiene que verificar el email.
    // Devolvemos el response completo para que Register.jsx decida qué hacer.
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignoramos errores de red al cerrar sesión
    }
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    const data = await api('/api/auth/me');
    setUser(data.user);
    return data.user;
  }, []);

  const updateUser = useCallback((u) => setUser(u), []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refresh, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}