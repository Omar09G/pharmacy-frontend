import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useNavigate } from 'react-router';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import Badge from '../ui/Badge';

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
    <header className="h-16 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex items-center justify-between px-4 md:px-6">
      <button
        onClick={toggleSidebar}
        title={t('tooltips.openSidebar')}
        className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 md:hidden"
      >
        <Menu size={20} className="text-neutral-600 dark:text-neutral-300" />
      </button>

      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        <LanguageToggle />
        <ThemeToggle />

        <div className="flex items-center gap-2 pl-3 border-l border-neutral-200 dark:border-neutral-700">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {user?.fullName}
            </p>
            <Badge color={user?.role === 'ADMIN' ? 'green' : 'blue'}>
              {user?.role}
            </Badge>
          </div>
          <button
            onClick={handleLogout}
            title={t('tooltips.logout')}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-neutral-500 hover:text-red-600 transition-colors"
            aria-label="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
