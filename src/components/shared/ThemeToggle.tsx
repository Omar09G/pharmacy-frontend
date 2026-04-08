import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useUIStore();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggle;
