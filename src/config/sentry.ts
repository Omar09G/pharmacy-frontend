import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const SENTRY_ENV = (import.meta.env.VITE_SENTRY_ENV as string) || 'development';

export function initSentry(): void {
  if (!SENTRY_DSN) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENV,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Performance — sample 20 % of transactions in production
    tracesSampleRate: SENTRY_ENV === 'production' ? 0.2 : 1.0,
    // Session Replay — record 10 % of sessions, 100 % on error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Only send errors from our own code
    allowUrls: [window.location.origin],
  });
}

/** Identify the logged-in user for Sentry context.
 * M-4: Only send non-PII fields (id + role). Username is omitted to avoid
 * sending personally identifiable information to a third-party service.
 */
export function setSentryUser(
  user: {
    id: number;
    username: string;
    role: string;
  } | null,
): void {
  if (!SENTRY_DSN) return;
  if (user) {
    Sentry.setUser({
      id: String(user.id),
      // username intentionally omitted — see M-4 in SECURITY_AUDIT_REPORT.md
      segment: user.role,
    });
  } else {
    Sentry.setUser(null);
  }
}

/** Capture an exception with optional extra context */
export function captureError(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  if (!SENTRY_DSN) return;
  Sentry.withScope((scope) => {
    if (context) scope.setExtras(context);
    Sentry.captureException(error);
  });
}
