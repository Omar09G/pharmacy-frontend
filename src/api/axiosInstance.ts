import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { useAuthStore } from '../store/authStore';
import { captureError } from '../config/sentry';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
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

// Response interceptor: on 401 → try refresh, retry once, else logout
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

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
