import { API_BASE_URL } from '../services/api';

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
