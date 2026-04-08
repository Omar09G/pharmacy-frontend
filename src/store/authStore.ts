import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

export interface AuthUser {
  id: number;
  fullName: string;
  username: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  setError: (error: string | null) => void;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
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
            set({
              token: data.token,
              user: {
                id: Number(data.id ?? 0),
                fullName: data.name ?? data.username,
                username: data.username,
                role: data.role,
              },
              isAuthenticated: true,
              loading: false,
              error: null,
            });
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
        set({ user: null, token: null, isAuthenticated: false, error: null });
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
                fullName: data.name ?? data.username,
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
              isAuthenticated: false,
              loading: false,
            });
          }
        } catch {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      },
    }),
    {
      name: 'pharmacy_auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
