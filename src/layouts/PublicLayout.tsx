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
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
      {/* Navbar */}
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1.5">
              <Pill size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg text-neutral-900 dark:text-white">
              Farmacia Santo Niño
            </span>
          </NavLink>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/app/dashboard')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {t('landing.enterSystem')}
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {t('auth.login')}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-white text-lg mb-2">
                Farmacia Santo Niño S.A. de C.V.
              </h3>
              <p className="text-sm">{t('landing.address')}</p>
              <p className="text-sm">{t('landing.phone')}</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Enlaces</h3>
              <ul className="text-sm space-y-1">
                <li>
                  <NavLink
                    to="/"
                    className="hover:text-white transition-colors"
                  >
                    Inicio
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/login"
                    className="hover:text-white transition-colors"
                  >
                    {t('auth.login')}
                  </NavLink>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Horario</h3>
              <p className="text-sm">{t('landing.schedule')}</p>
            </div>
          </div>
          <div className="mt-6 border-t border-neutral-700 pt-4 text-sm text-center">
            © {new Date().getFullYear()} Farmacia Santo Niño — Todos los
            derechos reservados
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
