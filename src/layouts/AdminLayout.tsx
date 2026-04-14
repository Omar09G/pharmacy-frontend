import React from 'react';
import { Outlet } from 'react-router';
import { ErrorBoundary } from 'react-error-boundary';
import Sidebar from '../components/shared/Sidebar';
import Topbar from '../components/shared/Topbar';
import { captureError } from '../config/sentry';

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: unknown;
  resetErrorBoundary: () => void;
}) {
  const message = error instanceof Error ? error.message : 'Error desconocido';
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Algo salió mal</h2>
      <p className="text-neutral-600 dark:text-neutral-400 mb-4 max-w-md">
        {message}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}

const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
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
