import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/albert-sans';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import './index.css';
import './i18n';
import App from './App.tsx';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { initSentry, setSentryUser } from './config/sentry';

// Initialize Sentry before anything else
initSentry();

// Theme is applied pre-render by the inline script in index.html.
// Re-apply here for HMR/dev edge cases where that script did not run.
const savedUI = JSON.parse(localStorage.getItem('pharmacy_ui') || '{}');
const savedTheme = (savedUI?.state?.theme ?? 'system') as
  'light' | 'dark' | 'system';
document.documentElement.classList.toggle(
  'dark',
  savedTheme === 'dark' ||
    (savedTheme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches),
);

// Restore session on load (cookie-based — always try profile)
const { user } = useAuthStore.getState();
useAuthStore.getState().restoreSession();
// Set Sentry user context if already logged in
if (user) {
  setSentryUser(user);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
