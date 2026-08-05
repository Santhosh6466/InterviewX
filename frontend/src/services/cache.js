// Smart in-memory client-side cache and request deduplication engine

class CacheEngine {
  constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default TTL for blazing-fast navigation
    this.cache = new Map();
    this.inFlightRequests = new Map();
    this.defaultTTL = defaultTTL;
  }

  // Generate deterministic cache key from method, url, and params
  getCacheKey(method = 'GET', url = '', params = null) {
    const normMethod = (method || 'GET').toUpperCase();
    let normUrl = url || '';
    let paramStr = '';
    
    if (params) {
      if (typeof params === 'string') {
        paramStr = params;
      } else if (params instanceof URLSearchParams) {
        paramStr = params.toString();
      } else if (typeof params === 'object') {
        const sortedKeys = Object.keys(params).sort();
        paramStr = sortedKeys.map(k => `${k}=${encodeURIComponent(params[k])}`).join('&');
      }
    }

    return `${normMethod}:${normUrl}${paramStr ? '?' + paramStr : ''}`;
  }

  // Retrieve cached data if valid
  get(keyOrMethod, url, params) {
    let key;
    if (url !== undefined) {
      key = this.getCacheKey(keyOrMethod, url, params);
    } else {
      key = keyOrMethod;
    }

    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Store data with optional custom TTL
  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
      timestamp: Date.now()
    });
  }

  // Check if an identical request is currently in-flight
  getInFlight(key) {
    return this.inFlightRequests.get(key) || null;
  }

  // Set an in-flight promise
  setInFlight(key, promise) {
    this.inFlightRequests.set(key, promise);
    promise.finally(() => {
      this.inFlightRequests.delete(key);
    });
  }

  // Invalidate specific cache keys or prefixes
  invalidate(pattern) {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.inFlightRequests.clear();
  }
}

export const requestCache = new CacheEngine();
export default requestCache;
