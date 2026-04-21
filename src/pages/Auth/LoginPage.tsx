import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { showError } from '../../utils/alerts';
import { onRateLimit } from '../../api/axiosInstance';
import { Pill, Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading, error, setError } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // M-5: track rate-limit block expiry so we can disable the form and show countdown
  const [rateLimitUntil, setRateLimitUntil] = useState<Date | null>(null);
  const [rateLimitSecsLeft, setRateLimitSecsLeft] = useState(0);

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    '/app/dashboard';

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  // Subscribe to 429 events from the axios interceptor
  useEffect(() => {
    const unsub = onRateLimit(({ retryAfter }) => {
      setRateLimitUntil(retryAfter);
    });
    return unsub;
  }, []);

  // Countdown timer while rate-limited
  useEffect(() => {
    if (!rateLimitUntil) return;
    const tick = () => {
      const secs = Math.max(
        0,
        Math.ceil((rateLimitUntil.getTime() - Date.now()) / 1000),
      );
      setRateLimitSecsLeft(secs);
      if (secs === 0) setRateLimitUntil(null);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [rateLimitUntil]);

  useEffect(() => {
    if (error) {
      showError(error);
      setError(null);
    }
  }, [error, setError]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (rateLimitUntil) return; // blocked by rate limit
      try {
        await login({ username, password });
        navigate(from, { replace: true });
      } catch {
        // error handled by store
      }
    },
    [rateLimitUntil, login, username, password, navigate, from],
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-700 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-xl p-3 mb-4">
            <Pill size={32} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {t('auth.login')}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {t('auth.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              {t('auth.username')}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
              autoComplete="username"
              placeholder={t('auth.username')}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              {t('auth.password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-10"
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                title={t('tooltips.togglePassword')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* M-5: Show rate-limit countdown if blocked */}
          {rateLimitUntil && rateLimitSecsLeft > 0 && (
            <p className="text-center text-sm text-red-500 dark:text-red-400">
              {t('auth.rateLimited', {
                seconds: rateLimitSecsLeft,
                defaultValue: `Demasiados intentos. Intenta en ${rateLimitSecsLeft}s`,
              })}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !!rateLimitUntil}
            title={t('tooltips.login')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>{' '}
                {t('auth.signing')}
              </>
            ) : (
              t('auth.login')
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
