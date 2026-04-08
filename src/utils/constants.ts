export const API_BASE_URL = 'http://localhost:8080/v1/api';
export const DEFAULT_PAGE_SIZE = 10;
export const TOTAL_PAGE_SIZE_OPTIONS = 0;
export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  CUSTOMER: 'CUSTOMER',
  OTHER: 'OTHER',
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];
