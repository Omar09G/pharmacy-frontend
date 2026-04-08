export type LoginData = {
  role: string;
  token: string;
  tokenRefresh?: string;
  username?: string;
  name?: string;
  id: number;
};

export type User = {
  id?: number;
  name?: string;
  username?: string;
  role?: string;
} | null;

export type AuthContextValue = {
  user: User;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setError: (error: string | null) => void;
};
