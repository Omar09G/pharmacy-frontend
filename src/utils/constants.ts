// Prefer Vite env variable `VITE_API_BASE_URL`. Falls back to localhost for development.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/v1/api';
export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [25, 50, 100, 150, 200];
export const TOTAL_PAGE_SIZE_OPTIONS = 0;
export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  CUSTOMER: 'CUSTOMER',
  OTHER: 'OTHER',
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];
