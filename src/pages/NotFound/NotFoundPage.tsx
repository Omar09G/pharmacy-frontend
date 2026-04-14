import React from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950 text-center p-8">
      <h1 className="text-8xl font-bold text-neutral-300 dark:text-neutral-700">
        404
      </h1>
      <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mt-4">
        {t('common.pageNotFound') || 'Página no encontrada'}
      </h2>
      <p className="text-neutral-500 dark:text-neutral-400 mt-2 max-w-md">
        {t('common.pageNotFoundDesc') ||
          'La página que buscas no existe o fue movida.'}
      </p>
      <Link
        to="/app/dashboard"
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        {t('common.goHome') || 'Ir al inicio'}
      </Link>
    </div>
  );
};

export default NotFoundPage;
