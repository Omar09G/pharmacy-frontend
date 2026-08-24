import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import { Pill } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';

const PublicLayout: React.FC = () => {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-3 focus:left-3 focus:bg-brand focus:text-on-brand focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium"
      >
        {t('a11y.skipToContent')}
      </a>

      {/* Navbar */}
      <header className="bg-surface/80 backdrop-blur border-b border-line sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="bg-brand text-on-brand rounded-xl p-1.5">
              <Pill size={20} aria-hidden="true" />
            </div>
            <span className="font-display font-semibold text-lg text-ink">
              Farmacia Santo Niño
            </span>
          </NavLink>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/app/dashboard')}
                title={t('tooltips.enterSystem')}
                className="px-4 py-2 bg-brand hover:bg-brand-strong text-on-brand rounded-lg text-sm font-medium transition-colors active:scale-[0.98]"
              >
                {t('landing.enterSystem')}
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                title={t('tooltips.login')}
                className="px-4 py-2 bg-brand hover:bg-brand-strong text-on-brand rounded-lg text-sm font-medium transition-colors active:scale-[0.98]"
              >
                {t('auth.login')}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-canvas border-t border-line text-muted py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-display font-semibold text-ink text-lg mb-2">
                Farmacia Santo Niño S.A. de C.V.
              </h3>
              <p className="text-sm">{t('landing.address')}</p>
              <p className="text-sm font-mono tabular-nums">
                {t('landing.phone')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-2">Enlaces</h3>
              <ul className="text-sm space-y-1">
                <li>
                  <NavLink
                    to="/"
                    className="hover:text-brand transition-colors"
                  >
                    Inicio
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/login"
                    className="hover:text-brand transition-colors"
                  >
                    {t('auth.login')}
                  </NavLink>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-2">Horario</h3>
              <p className="text-sm font-mono tabular-nums">
                {t('landing.schedule')}
              </p>
            </div>
          </div>
          <div className="mt-6 border-t border-line pt-4 text-sm text-center">
            © {new Date().getFullYear()} Farmacia Santo Niño — Todos los
            derechos reservados
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
