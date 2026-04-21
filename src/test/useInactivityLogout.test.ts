import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock authStore before importing the hook
vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

import { useAuthStore } from '../store/authStore';
import { useInactivityLogout } from '../hooks/useInactivityLogout';

// Helper to configure the store mock
function setupStore(isAuthenticated: boolean) {
  const logout = vi.fn().mockResolvedValue(undefined);
  vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated, logout } as never);
  return { logout };
}

describe('useInactivityLogout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('does nothing when user is not authenticated', () => {
    const { logout } = setupStore(false);
    renderHook(() =>
      useInactivityLogout({ logoutAfterMs: 1000, warningAfterMs: 500 }),
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(logout).not.toHaveBeenCalled();
  });

  it('calls logout after inactivity timeout', () => {
    const { logout } = setupStore(true);
    const onLogout = vi.fn();

    renderHook(() =>
      useInactivityLogout({
        logoutAfterMs: 5000,
        warningAfterMs: 3000,
        onLogout,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(5001);
    });

    expect(onLogout).toHaveBeenCalledOnce();
    expect(logout).toHaveBeenCalledOnce();
  });

  it('calls onWarning before logout', () => {
    setupStore(true);
    const onWarning = vi.fn();
    const onLogout = vi.fn();

    renderHook(() =>
      useInactivityLogout({
        logoutAfterMs: 5000,
        warningAfterMs: 3000,
        onWarning,
        onLogout,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(3001);
    });
    expect(onWarning).toHaveBeenCalledOnce();
    expect(onLogout).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('resets timers on user activity', () => {
    const { logout } = setupStore(true);

    renderHook(() =>
      useInactivityLogout({ logoutAfterMs: 5000, warningAfterMs: 3000 }),
    );

    // Advance to just before logout
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    // Simulate user activity (mousemove event)
    act(() => {
      window.dispatchEvent(new Event('mousemove'));
    });

    // Advance another 4 seconds — timer was reset so logout should NOT fire yet
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(logout).not.toHaveBeenCalled();
  });

  it('does not call onWarning twice on repeated activity', () => {
    setupStore(true);
    const onWarning = vi.fn();

    renderHook(() =>
      useInactivityLogout({
        logoutAfterMs: 5000,
        warningAfterMs: 3000,
        onWarning,
      }),
    );

    // Reach warning threshold
    act(() => {
      vi.advanceTimersByTime(3001);
    });
    expect(onWarning).toHaveBeenCalledOnce();

    // Activity resets, reach warning threshold again
    act(() => {
      window.dispatchEvent(new Event('keydown'));
    });
    act(() => {
      vi.advanceTimersByTime(3001);
    });
    // onWarning should have been called a second time (new warning cycle)
    expect(onWarning).toHaveBeenCalledTimes(2);
  });

  it('cleans up event listeners on unmount', () => {
    setupStore(true);
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useInactivityLogout({ logoutAfterMs: 5000, warningAfterMs: 3000 }),
    );

    unmount();

    expect(removeSpy).toHaveBeenCalled();
  });
});
