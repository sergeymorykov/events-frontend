import axios, { InternalAxiosRequestConfig } from 'axios';
import { toApiError } from './apiError';

// В dev режиме используем прокси через Vite, в production - прямой URL
const getBaseURL = () => {
  // В production используем переменную окружения или прямой URL
  return import.meta.env.VITE_API_BASE_URL || 'https://backend-api.sberhubproject.ru';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiError(error);

    if (apiError.status === 401) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    return Promise.reject(apiError);
  }
);

export default api;

