import { describe, it, expect, vi, beforeEach } from 'vitest';

// Partial mock: preserve AxiosError class, only mock HTTP methods
vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      post: vi.fn(),
      get: vi.fn(),
    },
  };
});
vi.mock('../config/sentry', () => ({ setSentryUser: vi.fn() }));
vi.mock('../utils/constants', () => ({
  API_BASE_URL: 'http://localhost:8081',
}));
vi.mock('../utils/apiErrorMapper', () => ({
  getLoginErrorMessage: vi.fn((err: unknown) => {
    // Simulate: 401 → loginFailed, others → generic key
    if (err && typeof err === 'object' && 'response' in err) {
      const e = err as { response?: { status?: number } };
      if (e.response?.status === 401) return 'apiErrors.loginFailed';
    }
    return 'apiErrors.unknown';
  }),
  getApiErrorMessage: vi.fn(() => 'apiErrors.unknown'),
}));

import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const mockUser = {
  id: 1,
  name: 'Test User',
  username: 'testuser',
  role: 'admin',
};

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state between tests
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('sets isAuthenticated and user on success', async () => {
      vi.mocked(axios.post).mockResolvedValueOnce({
        data: { data: mockUser },
      });

      await useAuthStore
        .getState()
        .login({ username: 'testuser', password: 'pass' });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.username).toBe('testuser');
      expect(state.user?.role).toBe('admin');
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('sets error on login failure (401)', async () => {
      const err = new axios.AxiosError('Unauthorized');
      err.response = {
        status: 401,
        data: {},
        headers: {},
        config: {} as never,
        statusText: '',
      };
      vi.mocked(axios.post).mockRejectedValueOnce(err);

      await expect(
        useAuthStore.getState().login({ username: 'bad', password: 'bad' }),
      ).rejects.toThrow();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBe('apiErrors.loginFailed');
      expect(state.loading).toBe(false);
    });

    it('sets error when response has no id field', async () => {
      vi.mocked(axios.post).mockResolvedValueOnce({ data: { data: {} } });

      await useAuthStore
        .getState()
        .login({ username: 'test', password: 'pass' });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Invalid response from server');
    });

    it('sets loading=true while logging in', async () => {
      let resolveLogin!: (v: unknown) => void;
      vi.mocked(axios.post).mockReturnValueOnce(
        new Promise((r) => {
          resolveLogin = r;
        }),
      );

      const loginPromise = useAuthStore
        .getState()
        .login({ username: 'u', password: 'p' });

      expect(useAuthStore.getState().loading).toBe(true);
      resolveLogin({ data: { data: mockUser } });
      await loginPromise;
      expect(useAuthStore.getState().loading).toBe(false);
    });
  });

  describe('logout', () => {
    it('clears user and isAuthenticated on logout', async () => {
      useAuthStore.setState({
        user: {
          id: 1,
          fullName: 'Test',
          username: 'test',
          role: 'admin',
          permissions: [],
        },
        isAuthenticated: true,
      });
      vi.mocked(axios.post).mockResolvedValueOnce({});

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('clears state even if backend logout call fails', async () => {
      useAuthStore.setState({
        user: {
          id: 1,
          fullName: 'Test',
          username: 'test',
          role: 'admin',
          permissions: [],
        },
        isAuthenticated: true,
      });
      vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network error'));

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('refreshSession', () => {
    it('returns true when refresh succeeds', async () => {
      vi.mocked(axios.post).mockResolvedValueOnce({
        data: { data: { ok: true } },
      });
      const result = await useAuthStore.getState().refreshSession();
      expect(result).toBe(true);
    });

    it('returns false when refresh fails', async () => {
      vi.mocked(axios.post).mockRejectedValueOnce(new Error('fail'));
      const result = await useAuthStore.getState().refreshSession();
      expect(result).toBe(false);
    });
  });

  describe('setError', () => {
    it('updates error field', () => {
      useAuthStore.getState().setError('Custom error');
      expect(useAuthStore.getState().error).toBe('Custom error');
    });

    it('clears error when null is passed', () => {
      useAuthStore.setState({ error: 'some error' });
      useAuthStore.getState().setError(null);
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('restoreSession', () => {
    it('sets authenticated state when profile endpoint returns user', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: { data: mockUser },
      });

      await useAuthStore.getState().restoreSession();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.username).toBe('testuser');
    });

    it('sets unauthenticated state when profile call fails', async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('Unauthorized'));

      await useAuthStore.getState().restoreSession();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });
});
