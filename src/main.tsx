import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App.tsx';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';

// Apply saved theme before first render
const savedUI = JSON.parse(localStorage.getItem('pharmacy_ui') || '{}');
if (savedUI?.state?.theme === 'dark') {
  document.documentElement.classList.add('dark');
}

// Restore session on load
const { token } = useAuthStore.getState();
if (token) {
  useAuthStore.getState().restoreSession();
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
