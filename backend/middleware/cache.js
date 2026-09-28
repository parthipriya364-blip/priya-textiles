const NodeCache = require('node-cache');

// Create cache instance
// stdTTL: default time-to-live in seconds
// checkperiod: period in seconds to automatically delete expired keys
const cache = new NodeCache({ 
  stdTTL: 600, // 10 minutes default
  checkperiod: 120, // Check every 2 minutes
  useClones: false // Better performance, don't clone data
});

/**
 * Cache middleware for GET requests
 * @param {number} duration - Cache duration in seconds (default: 600)
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (duration = 600) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create cache key from URL and query params
    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      console.log(`✅ Cache HIT: ${key}`);
      return res.json(cachedResponse);
    }

    console.log(`❌ Cache MISS: ${key}`);
    
    // Store original res.json function
    const originalJson = res.json.bind(res);
    
    // Override res.json to cache the response
    res.json = (body) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, body, duration);
        console.log(`💾 Cached: ${key} for ${duration}s`);
      }
      originalJson(body);
    };

    next();
  };
};

/**
 * Clear cache for specific pattern
 * @param {string} pattern - Pattern to match cache keys
 */
const clearCache = (pattern) => {
  const keys = cache.keys();
  let cleared = 0;
  
  keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.del(key);
      cleared++;
    }
  });
  
  console.log(`🗑️  Cleared ${cleared} cache entries matching: ${pattern}`);
  return cleared;
};

/**
 * Clear all cache
 */
const clearAllCache = () => {
  cache.flushAll();
  console.log('🗑️  All cache cleared');
};

/**
 * Get cache stats
 */
const getCacheStats = () => {
  return cache.getStats();
};

module.exports = { 
  cacheMiddleware, 
  clearCache, 
  clearAllCache, 
  getCacheStats,
  cache // Export cache instance for manual operations
};
