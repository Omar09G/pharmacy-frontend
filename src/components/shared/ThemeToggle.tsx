import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUIStore, type Theme } from '../../store/uiStore';

const icons: Record<Theme, React.ReactNode> = {
  light: <Sun size={20} />,
  dark: <Moon size={20} />,
  system: <Monitor size={20} />,
};

const nextThemeMap: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

const ThemeToggle: React.FC = () => {
  const { t } = useTranslation();
  const theme = useUIStore((s) => s.theme);
  const cycleTheme = useUIStore((s) => s.cycleTheme);

  const nextTheme = nextThemeMap[theme];

  return (
    <button
      onClick={cycleTheme}
      title={t('tooltips.toggleTheme')}
      aria-label={t('theme.current', { theme: t(`theme.${theme}`) })}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink"
    >
      {icons[theme]}
      <span className="sr-only">
        {t('theme.next', { theme: t(`theme.${nextTheme}`) })}
      </span>
    </button>
  );
};

export default ThemeToggle;
