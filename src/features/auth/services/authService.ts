import axios from 'axios';
import { LoginData } from '../utils/Utils';

const API_URL = 'http://localhost:8080/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (
  username: string,
  password: string,
): Promise<LoginData | undefined> => {
  const res = await client.post('/login', { username, password });
  // backend may wrap response; try to return either res.data.data or res.data itself
  return (res.data && (res.data.data ?? res.data)) as LoginData | undefined;
};

export const fetchProfile = async (token: string) => {
  const res = await client.get('/auth/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });

  return (res.data && (res.data.data ?? res.data)) as LoginData | undefined;
};

export default client;
