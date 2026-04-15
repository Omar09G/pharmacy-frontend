import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { setSentryUser } from '../config/sentry';
import { getLoginErrorMessage } from '../utils/apiErrorMapper';

export interface AuthUser {
  id: number;
  fullName: string;
  username: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  setError: (error: string | null) => void;
  restoreSession: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
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
              withCredentials: true,
            },
          );
          const data = res.data?.data ?? res.data;
          if (data?.id) {
            const user = {
              id: Number(data.id ?? 0),
              fullName: data.name ?? data.fullName ?? data.username,
              username: data.username,
              role: data.role,
            };
            set({
              user,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
            setSentryUser(user);
          } else {
            set({ loading: false, error: 'Invalid response from server' });
          }
        } catch (err: unknown) {
          const msg = getLoginErrorMessage(err);
          set({ loading: false, error: msg });
          throw err;
        }
      },

      logout: async () => {
        try {
          await axios.post(`${API_BASE_URL}/auth/logout`, null, {
            withCredentials: true,
          });
        } catch {
          // Even if the backend call fails, clear local state
        }
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
        setSentryUser(null);
      },

      setError: (error) => set({ error }),

      restoreSession: async () => {
        set({ loading: true });
        try {
          const res = await axios.get(`${API_BASE_URL}/auth/profile`, {
            withCredentials: true,
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
              isAuthenticated: false,
              loading: false,
            });
          }
        } catch {
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      },

      refreshSession: async () => {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
            withCredentials: true,
          });
          const data = res.data?.data ?? res.data;
          return !!data;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'pharmacy_auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
