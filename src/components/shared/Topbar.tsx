import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useNavigate } from 'react-router';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';

function initials(fullName?: string): string {
  if (!fullName) return '?';
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const Topbar: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-line bg-surface/80 backdrop-blur flex items-center justify-between px-4 md:px-6">
      <button
        onClick={toggleSidebar}
        title={t('tooltips.openSidebar')}
        aria-label={t('tooltips.openSidebar')}
        className="p-2 inline-flex items-center justify-center rounded-lg hover:bg-raised md:hidden"
      >
        <Menu size={20} className="text-muted" />
      </button>

      <div className="hidden md:block" />

      <div className="flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />

        <div className="flex items-center gap-3 pl-3 border-l border-line">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-ink leading-tight">
              {user?.fullName}
            </p>
            <span className="inline-block rounded-full bg-brand-soft text-brand px-2 py-px text-[11px] font-semibold">
              {user?.role}
            </span>
          </div>
          <div
            aria-hidden="true"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-brand text-on-brand text-xs font-bold select-none"
          >
            {initials(user?.fullName)}
          </div>
          <button
            onClick={handleLogout}
            title={t('tooltips.logout')}
            aria-label={t('auth.logout')}
            className="p-2 inline-flex items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-soft hover:text-danger"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
