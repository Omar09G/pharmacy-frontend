import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../../store/uiStore';

const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useUIStore();

  const toggle = () => {
    const next = language === 'es' ? 'en' : 'es';
    setLanguage(next);
    i18n.changeLanguage(next);
  };

  return (
    <button
      onClick={toggle}
      className="px-2 py-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-sm font-medium text-neutral-600 dark:text-neutral-300 transition-colors"
      title={language === 'es' ? 'Cambiar idioma' : 'Toggle language'}
      aria-label="Toggle language"
    >
      {language === 'es' ? '🇲🇽 ES' : '🇺🇸 EN'}
    </button>
  );
};

export default LanguageToggle;
