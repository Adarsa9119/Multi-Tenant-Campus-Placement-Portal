import axios from 'axios';
import { authStorage } from '../auth/authStorage.js';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

api.interceptors.request.use((config) => {
  const token = authStorage.token();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((r) => r, (error) => {
  if (error.response?.status === 401 && authStorage.token() && !error.config.url.includes('/auth/')) window.dispatchEvent(new Event('cp:logout'));
  return Promise.reject(error);
});

export const unwrap = (p) => p.then((r) => r.data);
export const errorMessage = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';
export default api;
