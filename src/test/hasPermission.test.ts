import { describe, it, expect } from 'vitest';
import { hasPermission } from '../store/authStore';
import type { AuthUser } from '../store/authStore';

const userWith = (role: string, permissions: string[]): AuthUser => ({
  id: 1,
  fullName: 'Test User',
  username: 'testuser',
  role,
  permissions,
});

describe('hasPermission', () => {
  it('grants everything to ADMIN regardless of stored permissions', () => {
    expect(hasPermission(userWith('ADMIN', []), 'PRODUCT_MANAGEMENT')).toBe(
      true,
    );
    expect(hasPermission(userWith('ADMIN', []), 'SALES_MANAGER')).toBe(true);
  });

  it('matches permissions held by the user', () => {
    const cashier = userWith('USER', ['SALES_MANAGER']);
    expect(hasPermission(cashier, 'SALES_MANAGER')).toBe(true);
    expect(hasPermission(cashier, 'PRODUCT_MANAGEMENT')).toBe(false);
  });

  it('is false for missing user or empty permission list', () => {
    expect(hasPermission(null, 'SALES_MANAGER')).toBe(false);
    expect(hasPermission(userWith('USER', []), 'SALES_MANAGER')).toBe(false);
  });
});
