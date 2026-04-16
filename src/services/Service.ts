import axios from 'axios';

const API_URL =
  import.meta.env.VITE_APP_API_URL || 'http://localhost:8080/v1/api';

const AxioscCient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor de respuestas (opcional)
AxioscCient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default AxioscCient;
