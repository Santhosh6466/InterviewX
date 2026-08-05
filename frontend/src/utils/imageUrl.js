const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://interviewx.up.railway.app';
  }
  return 'http://localhost:8080';
};

const API_BASE_URL = getApiBaseUrl();

export function getImageUrl(logoUrl) {
  if (!logoUrl) return null;
  if (typeof logoUrl !== 'string') return null;

  let url = logoUrl.trim().replace(/\\/g, '/');
  if (!url) return null;

  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${cleanPath}`;
}

export default getImageUrl;
