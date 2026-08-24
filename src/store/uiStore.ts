import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

const prefersDark = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches;

function resolveDark(theme: Theme): boolean {
  return theme === 'dark' || (theme === 'system' && prefersDark());
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', resolveDark(theme));
}

interface UIStore {
  theme: Theme;
  language: 'es' | 'en';
  sidebarOpen: boolean;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
  setLanguage: (lang: 'es' | 'en') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const THEME_ORDER: Theme[] = ['light', 'dark', 'system'];

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      theme: 'system',
      language: 'es',
      sidebarOpen: true,

      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },

      cycleTheme: () => {
        const next =
          THEME_ORDER[
            (THEME_ORDER.indexOf(get().theme) + 1) % THEME_ORDER.length
          ];
        applyTheme(next);
        set({ theme: next });
      },

      setLanguage: (lang) => set({ language: lang }),

      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'pharmacy_ui',
      partialize: (state) => ({ theme: state.theme, language: state.language }),
    },
  ),
);

window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', () => {
    if (useUIStore.getState().theme === 'system') {
      applyTheme('system');
    }
  });
