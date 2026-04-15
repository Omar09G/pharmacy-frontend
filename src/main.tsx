import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App.tsx';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { initSentry, setSentryUser } from './config/sentry';

// Initialize Sentry before anything else
initSentry();

// Apply saved theme before first render
const savedUI = JSON.parse(localStorage.getItem('pharmacy_ui') || '{}');
if (savedUI?.state?.theme === 'dark') {
  document.documentElement.classList.add('dark');
}

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
