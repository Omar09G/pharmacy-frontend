import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { setSentryUser } from '../config/sentry';

export interface AuthUser {
  id: number;
  fullName: string;
  username: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  setError: (error: string | null) => void;
  restoreSession: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const res = await axios.post(
            `${API_BASE_URL}/auth/login`,
            credentials,
            {
              headers: { 'Content-Type': 'application/json' },
            },
          );
          const data = res.data?.data ?? res.data;
          if (data?.token) {
            const user = {
              id: Number(data.id ?? 0),
              fullName: data.name ?? data.fullName ?? data.username,
              username: data.username,
              role: data.role,
            };
            set({
              token: data.token,
              refreshToken: data.refreshToken ?? null,
              user,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
            setSentryUser(user);
          } else {
            set({ loading: false, error: 'No token returned from server' });
          }
        } catch (err: unknown) {
          const msg = axios.isAxiosError(err)
            ? ((err.response?.data as { message?: string })?.message ??
              err.message)
            : 'Login failed';
          set({ loading: false, error: msg });
          throw err;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
        setSentryUser(null);
      },

      setError: (error) => set({ error }),

      restoreSession: async () => {
        const { token } = get();
        if (!token) return;
        set({ loading: true });
        try {
          const res = await axios.get(`${API_BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = res.data?.data ?? res.data;
          if (data) {
            set({
              user: {
                id: Number(data.id ?? 0),
                fullName: data.name ?? data.fullName ?? data.username,
                username: data.username,
                role: data.role,
              },
              isAuthenticated: true,
              loading: false,
            });
          } else {
            set({
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              loading: false,
            });
          }
        } catch {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      },

      refreshSession: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
          const res = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } },
          );
          const data = res.data?.data ?? res.data;
          if (data?.token) {
            set({
              token: data.token,
              refreshToken: data.refreshToken ?? refreshToken,
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'pharmacy_auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
