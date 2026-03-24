import React, { useEffect, useState } from 'react';
import { login as apiLogin, fetchProfile } from '../services/authService';
import axiosClient from '../services/authService';
import { AuthContext } from './authContext';
import { isAxiosError } from 'axios';
import { User } from '../utils/Utils';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<null | User>(null);

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('auth_token_pharm'),
  );
  const [loading, setLoading] = useState<boolean>(() =>
    Boolean(localStorage.getItem('auth_token_pharm')),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    // set header immediately so subsequent requests include it
    axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        // try to fetch the current user's profile to restore session
        const profile = await fetchProfile(token);
        if (profile) {
          setUser({
            id: String(profile.id ?? profile.id ?? '0'),
            name: profile.name ?? profile.username,
            username: profile.username,
            role: profile.role,
          });
        } else {
          // invalid profile -> clear token
          setUser(null);
          setToken(null);
          localStorage.removeItem('auth_token_pharm');
          delete axiosClient.defaults.headers.common.Authorization;
        }
      } catch (err: unknown) {
        console.log(err);
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token_pharm');
        delete axiosClient.defaults.headers.common.Authorization;
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiLogin(username, password);
      if (data && data.token) {
        localStorage.setItem('auth_token_pharm', data.token);
        axiosClient.defaults.headers.common.Authorization = `Bearer ${data.token}`;
        setToken(data.token);

        setUser({
          id: String(data.id ?? '0'),
          name: data.name ?? data.username,
          username: data.username,
          role: data.role,
        });
      } else {
        setError('No token returned from server');
      }
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const resp = err.response as
          | { data?: { message?: string } }
          | undefined;
        setError(resp?.data?.message ?? err.message ?? 'Login failed');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token_pharm');
    delete axiosClient.defaults.headers.common.Authorization;
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, error, login, logout, setError }}
    >
      {children}
    </AuthContext.Provider>
  );
};
