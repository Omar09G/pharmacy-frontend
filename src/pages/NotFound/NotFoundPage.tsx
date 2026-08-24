import React from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-canvas text-center p-8 grain relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-brand-soft blur-3xl"
      />
      <p
        aria-hidden="true"
        className="font-display font-semibold text-[10rem] md:text-[14rem] leading-none tracking-tighter text-brand/15 select-none"
      >
        404
      </p>
      <h1 className="font-display -mt-16 md:-mt-24 text-3xl font-semibold tracking-tight text-ink animate-rise">
        {t('common.pageNotFound') || 'Página no encontrada'}
      </h1>
      <p className="text-muted mt-3 max-w-md animate-rise [animation-delay:80ms]">
        {t('common.pageNotFoundDesc') ||
          'La página que buscas no existe o fue movida.'}
      </p>
      <Link
        to="/app/dashboard"
        title={t('tooltips.enterSystem')}
        className="mt-8 inline-flex min-h-11 items-center px-6 rounded-lg bg-brand hover:bg-brand-strong active:scale-[0.98] transition-all text-on-brand font-medium shadow-sm animate-rise [animation-delay:160ms]"
      >
        {t('common.goHome') || 'Ir al inicio'}
      </Link>
    </div>
  );
};

export default NotFoundPage;
