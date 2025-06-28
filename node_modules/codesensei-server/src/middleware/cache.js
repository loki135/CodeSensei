import NodeCache from 'node-cache';

// Create cache instance with 5 minutes TTL
const cache = new NodeCache({ stdTTL: 300 });

export const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create cache key from URL and user ID
    const userKey = req.user?.id || 'anonymous';
    const cacheKey = `${req.originalUrl}:${userKey}`;

    // Check if response is cached
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    // Store original res.json method
    const originalJson = res.json;

    // Override res.json to cache the response
    res.json = function(data) {
      // Cache the response
      cache.set(cacheKey, data, duration);
      
      // Call original method
      return originalJson.call(this, data);
    };

    next();
  };
};

export const clearCache = (pattern) => {
  if (pattern) {
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    cache.del(matchingKeys);
  } else {
    cache.flushAll();
  }
};

export default cache; 