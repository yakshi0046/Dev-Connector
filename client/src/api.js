import axios from 'axios';

const api = axios.create({ baseURL: `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// An expired or invalid token anywhere except the login forms signs the user out.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    if (err.response?.status === 401 && !url.startsWith('/auth/login') && !url.startsWith('/auth/register')) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(err);
  },
);

export function errorMessage(err) {
  const data = err.response?.data;
  if (data?.errors?.length) return data.errors.map((e) => e.msg).join(' ');
  if (data?.message) return data.message;
  return err.response ? 'Something went wrong' : 'Cannot reach the server. It may be waking up, so try again in a minute.';
}

export default api;
