const rateLimit = require('express-rate-limit');

// Helper function to check if request is from admin or localhost
const skipRateLimitForAdmin = (req) => {
  // Skip rate limiting for localhost IPs
  const ip = req.ip || req.connection.remoteAddress;
  if (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') {
    return true;
  }

  // Skip rate limiting for authenticated admin users
  if (req.user && req.user.role === 'admin') {
    return true;
  }

  return false;
};

// General API rate limiter - 500 requests per 5 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 5 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: skipRateLimitForAdmin, // Skip for admin and localhost
  handler: (req, res) => {
    console.log(`⚠️  Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again after 5 minutes.',
      retryAfter: '5 minutes'
    });
  }
});

// Stricter limiter for write operations - 50 per 15 minutes
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: {
    success: false,
    message: 'Too many write requests, please slow down.'
  },
  skip: (req) => {
    // Skip GET requests
    if (req.method === 'GET') return true;
    // Skip for admin and localhost
    return skipRateLimitForAdmin(req);
  },
  handler: (req, res) => {
    console.log(`⚠️  Write rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many write requests, please slow down.',
      retryAfter: '15 minutes'
    });
  }
});

// Very strict for expensive operations - 20 per hour
const expensiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    success: false,
    message: 'Rate limit exceeded for this operation. Please try again later.'
  },
  skip: skipRateLimitForAdmin, // Skip for admin and localhost
  handler: (req, res) => {
    console.log(`⚠️  Expensive operation rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Rate limit exceeded for this operation. Please try again after 1 hour.',
      retryAfter: '1 hour'
    });
  }
});

module.exports = { apiLimiter, writeLimiter, expensiveLimiter };
