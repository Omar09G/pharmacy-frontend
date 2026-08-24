import React from 'react';
import { Outlet } from 'react-router';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/shared/Sidebar';
import Topbar from '../components/shared/Topbar';
import Button from '../components/ui/Button';
import { captureError } from '../config/sentry';

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: unknown;
  resetErrorBoundary: () => void;
}) {
  const { t } = useTranslation();
  const message = error instanceof Error ? error.message : 'Error desconocido';
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
      <h2 className="font-display text-2xl font-bold text-danger mb-4">
        Algo salió mal
      </h2>
      <p className="text-muted mb-4 max-w-md">{message}</p>
      <Button onClick={resetErrorBoundary} title={t('tooltips.retry')}>
        Intentar de nuevo
      </Button>
    </div>
  );
}

const AdminLayout: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-3 focus:left-3 focus:bg-brand focus:text-on-brand focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium"
      >
        {t('a11y.skipToContent')}
      </a>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-6">
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(error, info) =>
              captureError(error, { componentStack: info.componentStack })
            }
          >
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
