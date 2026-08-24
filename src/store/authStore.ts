import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { API_BASE_URL } from '../utils/constants';
import { setSentryUser } from '../config/sentry';
import { getLoginErrorMessage } from '../utils/apiErrorMapper';
import { NATIVE_ACCESS_TOKEN_KEY } from '../api/axiosInstance';
import { getOriginRequestId, REQUEST_ID_HEADER } from '../api/requestId';
import { secureStorage } from '../utils/secureStorage';

const NATIVE_REFRESH_TOKEN_KEY = 'pharmacy_native_refresh_token';

/** Returns headers needed for native clients (Bearer + platform marker). */
function nativeAuthHeaders(): Record<string, string> {
  if (!Capacitor.isNativePlatform()) return {};
  // NOTE: This is called synchronously; for async secureStorage, the
  // interceptor in axiosInstance handles the async token read.
  return { 'X-Client-Platform': 'native' };
}

export interface AuthUser {
  id: number;
  fullName: string;
  username: string;
  role: string;
  /** Permission names granted to the user's role (from the JWT/login). */
  permissions: string[];
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

/** True when the current user holds the given permission (ADMIN bypasses). */
export function hasPermission(
  user: AuthUser | null,
  permission: string,
): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  return user.permissions?.includes(permission) ?? false;
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
              headers: {
                'Content-Type': 'application/json',
                // Signal native client so backend includes tokens in the body
                ...(Capacitor.isNativePlatform()
                  ? { 'X-Client-Platform': 'native' }
                  : {}),
                [REQUEST_ID_HEADER]: getOriginRequestId(),
              },
              withCredentials: true,
            },
          );
          const data = res.data?.data ?? res.data;
          if (data?.id) {
            // On native, persist tokens via secureStorage (Keychain/Keystore
            // when @capacitor/secure-storage is installed, Preferences
            // plugin, or localStorage as final fallback).
            if (Capacitor.isNativePlatform()) {
              if (data.accessToken)
                await secureStorage.setItem(
                  NATIVE_ACCESS_TOKEN_KEY,
                  data.accessToken,
                );
              if (data.refreshToken)
                await secureStorage.setItem(
                  NATIVE_REFRESH_TOKEN_KEY,
                  data.refreshToken,
                );
            }
            const user = {
              id: Number(data.id ?? 0),
              fullName: data.name ?? data.fullName ?? data.username,
              username: data.username,
              role: data.role,
              permissions: Array.isArray(data.permissions)
                ? data.permissions
                : [],
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
          const isNative = Capacitor.isNativePlatform();
          const storedRefresh = isNative
            ? await secureStorage.getItem(NATIVE_REFRESH_TOKEN_KEY)
            : null;
          await axios.post(
            `${API_BASE_URL}/auth/logout`,
            storedRefresh ? { refreshToken: storedRefresh } : null,
            {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
                [REQUEST_ID_HEADER]: getOriginRequestId(),
                ...nativeAuthHeaders(),
              },
            },
          );
        } catch {
          // Even if the backend call fails, clear local state
        }
        // Clear native token storage
        await secureStorage.removeItem(NATIVE_ACCESS_TOKEN_KEY);
        await secureStorage.removeItem(NATIVE_REFRESH_TOKEN_KEY);
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
            headers: {
              [REQUEST_ID_HEADER]: getOriginRequestId(),
              ...nativeAuthHeaders(),
            },
          });
          const data = res.data?.data ?? res.data;
          if (data) {
            set({
              user: {
                id: Number(data.id ?? 0),
                fullName: data.name ?? data.fullName ?? data.username,
                username: data.username,
                role: data.role,
                permissions: Array.isArray(data.permissions)
                  ? data.permissions
                  : [],
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
          const isNative = Capacitor.isNativePlatform();
          const storedRefresh = isNative
            ? await secureStorage.getItem(NATIVE_REFRESH_TOKEN_KEY)
            : null;
          const res = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            storedRefresh ? { refreshToken: storedRefresh } : null,
            {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
                ...(isNative ? { 'X-Client-Platform': 'native' } : {}),
                [REQUEST_ID_HEADER]: getOriginRequestId(),
              },
            },
          );
          const data = res.data?.data ?? res.data;
          if (isNative && data?.accessToken) {
            await secureStorage.setItem(
              NATIVE_ACCESS_TOKEN_KEY,
              data.accessToken,
            );
            if (data.refreshToken)
              await secureStorage.setItem(
                NATIVE_REFRESH_TOKEN_KEY,
                data.refreshToken,
              );
          }
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
