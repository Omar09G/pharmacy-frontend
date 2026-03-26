import axios from 'axios';

const API_URL = 'http://localhost:8080/v1/api';

export function getTokenLocalStorage(): string | null {
  return localStorage.getItem('auth_token_pharm');
}

const AxioscCient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

AxioscCient.interceptors.request.use(
  (config) => {
    const token = getTokenLocalStorage();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor de respuestas (opcional)
AxioscCient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Manejar token expirado o no autorizado
      localStorage.removeItem('auth_token_pharm');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default AxioscCient;
