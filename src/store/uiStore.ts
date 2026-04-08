import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  theme: 'light' | 'dark';
  language: 'es' | 'en';
  sidebarOpen: boolean;
  toggleTheme: () => void;
  setLanguage: (lang: 'es' | 'en') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      language: 'es',
      sidebarOpen: true,

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        if (next === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
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
