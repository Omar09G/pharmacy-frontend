import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { Capacitor } from '@capacitor/core';
import { API_BASE_URL } from '../utils/constants';
import { useAuthStore } from '../store/authStore';
import { captureError } from '../config/sentry';

export const NATIVE_ACCESS_TOKEN_KEY = 'pharmacy_native_access_token';

// C-2: Warn loudly if the API URL is using plain HTTP in production
if (import.meta.env.PROD && API_BASE_URL.startsWith('http://')) {
  console.error(
    '[Security] API_BASE_URL is using plain HTTP in a production build. ' +
      'All traffic including credentials will be sent unencrypted. ' +
      'Set VITE_APP_API_URL to an https:// URL for production deployments.',
  );
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor: on native (Capacitor/Android), attach stored Bearer token
// because HttpOnly cookies are blocked by SameSite=Strict cross-origin in WebView.
axiosInstance.interceptors.request.use((config) => {
  if (Capacitor.isNativePlatform()) {
    const token = localStorage.getItem(NATIVE_ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Client-Platform'] = 'native';
  }
  return config;
});

// ---------- Refresh-token machinery ----------
let refreshPromise: Promise<boolean> | null = null;

async function handleTokenRefresh(): Promise<boolean> {
  // Deduplicate concurrent refresh attempts
  if (!refreshPromise) {
    refreshPromise = useAuthStore
      .getState()
      .refreshSession()
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// ---------- 429 Rate-limit tracking ----------

/** Emitted when the server returns HTTP 429. Consumers can subscribe to show UI feedback. */
export type RateLimitEvent = {
  /** ISO timestamp when the block expires (or null if Retry-After was not provided). */
  retryAfter: Date | null;
};

type RateLimitListener = (event: RateLimitEvent) => void;
const rateLimitListeners: RateLimitListener[] = [];

/** Subscribe to 429 events. Returns an unsubscribe function. */
export function onRateLimit(listener: RateLimitListener): () => void {
  rateLimitListeners.push(listener);
  return () => {
    const idx = rateLimitListeners.indexOf(listener);
    if (idx !== -1) rateLimitListeners.splice(idx, 1);
  };
}

function notifyRateLimit(headers: Record<string, string>): void {
  const retryHeader = headers['retry-after'];
  let retryAfter: Date | null = null;
  if (retryHeader) {
    const seconds = parseInt(retryHeader, 10);
    if (!isNaN(seconds)) {
      retryAfter = new Date(Date.now() + seconds * 1000);
    }
  }
  rateLimitListeners.forEach((fn) => fn({ retryAfter }));
}

// Response interceptor: on 401 → try refresh, retry once, else logout
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // M-5: Handle rate limiting — notify subscribers so UI can show a countdown
    if (error.response?.status === 429) {
      notifyRateLimit((error.response.headers as Record<string, string>) ?? {});
      return Promise.reject(error);
    }

    // Only attempt refresh for 401, and only once per request
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshed = await handleTokenRefresh();

      if (refreshed) {
        // Retry the original request (cookie is now updated by the browser)
        return axiosInstance(originalRequest);
      }
    }

    // Refresh failed or non-401 error — logout
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    // Report server errors (5xx) to Sentry
    if (error.response && error.response.status >= 500) {
      captureError(error, {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
      });
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
