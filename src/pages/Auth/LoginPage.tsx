import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { showError } from '../../utils/alerts';
import { onRateLimit } from '../../api/axiosInstance';
import { Pill, Eye, EyeOff, Clock, MapPin } from 'lucide-react';

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

  const fieldClasses =
    'w-full px-4 py-2.5 rounded-lg border border-line bg-surface text-ink outline-none focus:border-brand transition-colors';

  return (
    <div className="min-h-screen flex bg-canvas">
      {/* Brand panel */}
      <aside
        aria-hidden="true"
        className="hidden lg:flex w-[42%] shrink-0 bg-brand-strong dark:bg-surface relative overflow-hidden grain"
      >
        <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-on-brand w-full">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/15 p-2 backdrop-blur">
              <Pill size={28} />
            </div>
            <span className="font-display text-2xl font-semibold tracking-tight">
              Farmacia Santo Niño
            </span>
          </div>

          <div>
            <p className="font-display text-4xl font-semibold leading-tight tracking-tight max-w-md">
              {t('landing.hero')}
            </p>
            <p className="mt-4 max-w-sm text-white/80">{t('auth.subtitle')}</p>
          </div>

          <div className="space-y-2 text-sm text-white/80">
            <p className="flex items-center gap-2">
              <Clock size={16} aria-hidden="true" />
              {t('landing.schedule')}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={16} aria-hidden="true" />
              {t('landing.address')}
            </p>
          </div>
        </div>
      </aside>

      {/* Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-rise">
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="bg-brand-soft rounded-xl p-3 mb-4 text-brand">
              <Pill size={32} aria-hidden="true" />
            </div>
          </div>

          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink mb-1">
            {t('auth.welcome')}
          </h1>
          <h2 className="sr-only">{t('auth.login')}</h2>
          <p className="text-muted mb-8">{t('auth.subtitle')}</p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate={false}
          >
            <div>
              <label
                htmlFor="login-username"
                className="block text-sm font-medium text-ink mb-1.5"
              >
                {t('auth.username')}
              </label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={fieldClasses}
                required
                autoComplete="username"
                placeholder={t('auth.username')}
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-ink mb-1.5"
              >
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${fieldClasses} pr-10`}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  title={t('tooltips.togglePassword')}
                  aria-label={t('tooltips.togglePassword')}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:text-ink transition-colors"
                >
                  {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* M-5: Show rate-limit countdown if blocked */}
            {rateLimitUntil && rateLimitSecsLeft > 0 && (
              <p
                role="alert"
                className="text-center text-sm text-danger font-mono tabular-nums"
              >
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
              className="w-full min-h-11 py-2.5 bg-brand hover:bg-brand-strong active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-on-brand font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
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
      </main>
    </div>
  );
};

export default LoginPage;
