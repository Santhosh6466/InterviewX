import axios from 'axios';
import { toast } from 'react-hot-toast';
import requestCache from './cache';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Retrieve default Axios adapter
const defaultAdapter = axios.getAdapter(axios.defaults.adapter || ['xhr', 'http', 'fetch']);

// Custom adapter with in-memory caching and deduplication
const cachingAdapter = async (config) => {
  const method = (config.method || 'get').toLowerCase();
  const isGet = method === 'get';
  const shouldCache = isGet && config.cache !== false;

  if (shouldCache) {
    const cacheKey = requestCache.getCacheKey(method, config.url, config.params);
    const cachedData = requestCache.get(cacheKey);

    if (cachedData !== null && cachedData !== undefined) {
      return {
        data: cachedData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {},
        fromCache: true
      };
    }

    const inFlight = requestCache.getInFlight(cacheKey);
    if (inFlight) {
      return inFlight;
    }

    const requestPromise = (async () => {
      const response = await defaultAdapter(config);
      if (response && response.status >= 200 && response.status < 300) {
        requestCache.set(cacheKey, response.data, config.cacheTTL);
      }
      return response;
    })();

    requestCache.setInFlight(cacheKey, requestPromise);
    return requestPromise;
  }

  const response = await defaultAdapter(config);

  // Auto-invalidate relevant caches on mutations
  if (['post', 'put', 'delete', 'patch'].includes(method)) {
    if (config.url?.includes('/experiences') || config.url?.includes('/comments') || config.url?.includes('/like') || config.url?.includes('/bookmark')) {
      requestCache.invalidate('/api/experiences');
      requestCache.invalidate('/experiences');
      requestCache.invalidate('/users/me/bookmarks');
    }
    if (config.url?.includes('/companies')) {
      requestCache.invalidate('/api/companies');
    }
    if (config.url?.includes('/users') || config.url?.includes('/profile')) {
      requestCache.invalidate('/users');
      requestCache.invalidate('/profile');
    }
    if (config.url?.includes('/notifications')) {
      requestCache.invalidate('/notifications');
    }
  }

  return response;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000,
  adapter: cachingAdapter,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Expose cache controls on api instance
api.invalidateCache = (pattern) => requestCache.invalidate(pattern);
api.clearCache = () => requestCache.clear();

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
        requestCache.clear();
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

