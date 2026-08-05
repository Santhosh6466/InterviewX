import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token to every protected request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 Unauthorized and global error notifications
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        // Clear stored credentials and redirect to signin on unauthorized response
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.hash !== '#/signin' && window.location.hash !== '#/signup' && window.location.hash !== '#/' && window.location.hash !== '') {
          toast.error('Session expired. Please sign in again.', { id: 'session-expired-toast' });
          window.location.hash = '#/signin';
        }
      } else if (status === 429) {
        toast.error('Too many requests. Please wait a moment before trying again.', {
          id: 'rate-limit-toast',
        });
      }
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timed out. Please check your connection.', { id: 'timeout-toast' });
    }
    return Promise.reject(error);
  }
);

export default api;
