export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  name: string;
  role: string;
  token: string;
  tokenRefresh?: string;
}

export interface UserProfile {
  id: number;
  username: string;
  name: string;
  role: string;
}
