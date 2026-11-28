import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 12000,
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const reqUrl = String(error.config?.url || '');
    const isAuthAttempt =
      reqUrl.includes('/user/login') ||
      reqUrl.includes('/user/register') ||
      reqUrl.includes('/admin/login');

    if (status === 401 && !isAuthAttempt && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
