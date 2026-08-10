import axios from 'axios';
import { useAuthStore } from '../stores/auth';

export function useApi() {
  const auth = useAuthStore();

  const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
  });

  api.interceptors.request.use((config) => {
    if (auth.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        auth.logout();
      }
      return Promise.reject(err);
    }
  );

  return api;
}
