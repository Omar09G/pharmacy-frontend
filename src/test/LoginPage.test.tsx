import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock dependencies before imports
vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: null, pathname: '/login' }),
}));

vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('../utils/alerts', () => ({
  showError: vi.fn(),
}));

vi.mock('../api/axiosInstance', () => ({
  onRateLimit: vi.fn(() => () => {}),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

import { useAuthStore } from '../store/authStore';
import LoginPage from '../pages/Auth/LoginPage';

function setupStore(overrides: Partial<ReturnType<typeof vi.fn>> = {}) {
  const login = vi.fn().mockResolvedValue(undefined);
  vi.mocked(useAuthStore).mockReturnValue({
    login,
    isAuthenticated: false,
    loading: false,
    error: null,
    setError: vi.fn(),
    ...overrides,
  } as never);
  return { login };
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders username and password fields', () => {
    setupStore();
    render(<LoginPage />);

    expect(screen.getByPlaceholderText('auth.username')).toBeInTheDocument();
    // Password field uses bullet placeholder, not i18n key
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('has autoComplete="username" on the username field', () => {
    setupStore();
    render(<LoginPage />);

    const usernameInput = screen.getByPlaceholderText('auth.username');
    expect(usernameInput).toHaveAttribute('autocomplete', 'username');
  });

  it('has autoComplete="current-password" on the password field', () => {
    setupStore();
    render(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  });

  it('calls login with entered credentials on submit', async () => {
    const { login } = setupStore();
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('auth.username'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'mypassword' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /auth\.login/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'mypassword',
      });
    });
  });

  it('submit button is disabled while loading', () => {
    setupStore({ loading: true } as never);
    render(<LoginPage />);

    // Button is identified by its stable title attribute (text changes during loading)
    const button = screen.getByTitle('tooltips.login');
    expect(button).toBeDisabled();
  });

  it('renders the login title', () => {
    setupStore();
    render(<LoginPage />);
    // Title uses h2 element with t('auth.login')
    expect(
      screen.getByRole('heading', { name: 'auth.login' }),
    ).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    setupStore();
    render(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Find toggle button by its title attribute
    const toggleBtn = screen.getByTitle('tooltips.togglePassword');
    fireEvent.click(toggleBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
