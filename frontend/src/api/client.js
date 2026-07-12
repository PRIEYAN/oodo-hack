import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050/api',
});

// Attach JWT from localStorage on every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('transitops_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize server error messages so callers can show a toast.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error || err.message || 'Request failed.';
    return Promise.reject(new Error(message));
  }
);

export default api;
