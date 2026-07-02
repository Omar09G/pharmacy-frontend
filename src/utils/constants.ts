import { Capacitor } from '@capacitor/core';

/**
 * Resolves the API base URL depending on the runtime platform:
 *
 * Priority (highest → lowest):
 * 1. `VITE_APP_API_URL_ANDROID` — used only when running on a native device/emulator.
 *    Set to `http://10.0.2.2:8081/v1/api` for Android emulator (maps to host machine).
 * 2. `VITE_APP_API_URL` — shared URL used by web (and Android if no specific override).
 * 3. Hard-coded dev defaults:
 *    - Android native → `http://10.0.2.2:8081/v1/api`
 *    - Web           → `http://localhost:8081/v1/api`
 */
export const API_BASE_URL = (() => {
  const isNative = Capacitor.isNativePlatform();

  if (isNative && import.meta.env.VITE_APP_API_URL_ANDROID) {
    return import.meta.env.VITE_APP_API_URL_ANDROID as string;
  }
  if (import.meta.env.VITE_APP_API_URL) {
    return import.meta.env.VITE_APP_API_URL as string;
  }
  // Dev fallback — no env config needed for local development
  return isNative
    ? 'http://10.0.2.2:8081/v1/api'
    : 'http://localhost:8081/v1/api';
})();
export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [25, 50, 100, 150, 200, 500, 1000];
export const TOTAL_PAGE_SIZE_OPTIONS = 0;
export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  CUSTOMER: 'CUSTOMER',
  OTHER: 'OTHER',
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];
