import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

/**
 * A-5 + M-9: Inactivity timeout with pre-expiry warning.
 *
 * Monitors mouse, keyboard, click, scroll and touch events.
 * - After `warningAfterMs` (default 13 min) calls `onWarning` so the UI
 *   can show a "session about to expire" dialog.
 * - After `logoutAfterMs`  (default 15 min) calls `onLogout` and triggers
 *   the store logout.
 *
 * The hook is a no-op when the user is not authenticated.
 */

const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  'mousemove',
  'keydown',
  'click',
  'scroll',
  'touchstart',
];

interface UseInactivityLogoutOptions {
  /** Total inactivity time before forced logout (ms). Default: 15 minutes. */
  logoutAfterMs?: number;
  /** Inactivity time before calling onWarning (ms). Default: 13 minutes. */
  warningAfterMs?: number;
  /** Called when the warning threshold is reached. Show a dialog here. */
  onWarning?: () => void;
  /** Called right before logout. Can be used to show a toast or clean up. */
  onLogout?: () => void;
}

export function useInactivityLogout({
  logoutAfterMs = 15 * 60 * 1000,
  warningAfterMs = 13 * 60 * 1000,
  onWarning,
  onLogout,
}: UseInactivityLogoutOptions = {}): void {
  const { isAuthenticated, logout } = useAuthStore();

  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnedRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    logoutTimer.current = null;
    warningTimer.current = null;
    warnedRef.current = false;
  }, []);

  const resetTimers = useCallback(() => {
    clearTimers();

    if (!isAuthenticated) return;

    warningTimer.current = setTimeout(() => {
      if (!warnedRef.current) {
        warnedRef.current = true;
        onWarning?.();
      }
    }, warningAfterMs);

    logoutTimer.current = setTimeout(() => {
      onLogout?.();
      logout();
    }, logoutAfterMs);
  }, [
    isAuthenticated,
    logoutAfterMs,
    warningAfterMs,
    onWarning,
    onLogout,
    logout,
    clearTimers,
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers();
      return;
    }

    resetTimers();

    const handleActivity = () => resetTimers();

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true }),
    );

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity),
      );
    };
  }, [isAuthenticated, resetTimers, clearTimers]);
}
