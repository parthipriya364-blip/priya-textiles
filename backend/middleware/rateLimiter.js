/**
 * Rate Limiting and Account Lockout Middleware
 * 
 * Features:
 * - IP-based rate limiting: 10 requests per minute
 * - Account lockout: 5 failed attempts = 15 minute lockout
 * - Progressive delay on failed attempts
 * - Email notification on lockout
 * - Generic error messages (no information leakage)
 */

const { sendAccountLockoutEmail } = require('../utils/emailService');

// In-memory storage for rate limiting and lockout tracking
// In production, replace with Redis for distributed systems
class RateLimitStore {
  constructor() {
    this.ipAttempts = new Map(); // Track requests per IP
    this.loginAttempts = new Map(); // Track failed login attempts per email
    this.lockedAccounts = new Map(); // Track locked accounts
  }

  // Clean up expired entries every 5 minutes
  startCleanup() {
    setInterval(() => {
      const now = Date.now();
      
      // Clean up IP rate limit entries older than 1 minute
      for (const [ip, data] of this.ipAttempts.entries()) {
        if (now - data.firstAttempt > 60000) {
          this.ipAttempts.delete(ip);
        }
      }
      
      // Clean up login attempt entries older than 15 minutes
      for (const [email, data] of this.loginAttempts.entries()) {
        if (now - data.firstAttempt > 900000) {
          this.loginAttempts.delete(email);
        }
      }
      
      // Clean up expired lockouts
      for (const [email, lockoutTime] of this.lockedAccounts.entries()) {
        if (now > lockoutTime) {
          this.lockedAccounts.delete(email);
          this.loginAttempts.delete(email);
          console.log(`🔓 Account unlocked: ${email}`);
        }
      }
    }, 5 * 60 * 1000); // Run every 5 minutes
  }

  // Track IP-based rate limit
  trackIPRequest(ip) {
    const now = Date.now();
    const ipData = this.ipAttempts.get(ip);

    if (!ipData) {
      this.ipAttempts.set(ip, {
        count: 1,
        firstAttempt: now
      });
      return { allowed: true, remaining: 9 };
    }

    // Reset if more than 1 minute has passed
    if (now - ipData.firstAttempt > 60000) {
      this.ipAttempts.set(ip, {
        count: 1,
        firstAttempt: now
      });
      return { allowed: true, remaining: 9 };
    }

    // Increment count
    ipData.count++;
    const remaining = Math.max(0, 10 - ipData.count);

    return {
      allowed: ipData.count <= 10,
      remaining,
      retryAfter: ipData.count > 10 ? Math.ceil((60000 - (now - ipData.firstAttempt)) / 1000) : 0
    };
  }

  // Track failed login attempt
  trackFailedLogin(email) {
    const now = Date.now();
    const attemptData = this.loginAttempts.get(email);

    if (!attemptData) {
      this.loginAttempts.set(email, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now
      });
      return {
        attempts: 1,
        shouldLock: false,
        delay: 1000 // 1 second delay
      };
    }

    // Reset if more than 15 minutes have passed
    if (now - attemptData.firstAttempt > 900000) {
      this.loginAttempts.set(email, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now
      });
      return {
        attempts: 1,
        shouldLock: false,
        delay: 1000
      };
    }

    // Increment failed attempts
    attemptData.count++;
    attemptData.lastAttempt = now;

    // Progressive delay calculation: 2^(attempts-1) seconds (max 30 seconds)
    const delay = Math.min(Math.pow(2, attemptData.count - 1) * 1000, 30000);

    // Lock account after 5 failed attempts
    const shouldLock = attemptData.count >= 5;

    return {
      attempts: attemptData.count,
      shouldLock,
      delay
    };
  }

  // Lock an account
  lockAccount(email) {
    const lockoutTime = Date.now() + (15 * 60 * 1000); // 15 minutes from now
    this.lockedAccounts.set(email, lockoutTime);
    console.log(`🔒 Account locked: ${email} until ${new Date(lockoutTime).toISOString()}`);
  }

  // Check if account is locked
  isAccountLocked(email) {
    const lockoutTime = this.lockedAccounts.get(email);
    if (!lockoutTime) {
      return { locked: false };
    }

    const now = Date.now();
    if (now > lockoutTime) {
      // Lockout expired, clean up
      this.lockedAccounts.delete(email);
      this.loginAttempts.delete(email);
      return { locked: false };
    }

    return {
      locked: true,
      retryAfter: Math.ceil((lockoutTime - now) / 1000)
    };
  }

  // Reset failed attempts (on successful login)
  resetFailedAttempts(email) {
    this.loginAttempts.delete(email);
  }

  // Get current attempt count
  getAttemptCount(email) {
    const data = this.loginAttempts.get(email);
    return data ? data.count : 0;
  }
}

// Create singleton instance
const rateLimitStore = new RateLimitStore();
rateLimitStore.startCleanup();

/**
 * IP-based rate limiting middleware
 * Limits requests to 10 per minute per IP
 * Skips rate limiting for localhost (development)
 */
const ipRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  // Skip rate limiting for localhost IPs (development)
  if (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') {
    return next();
  }
  
  const result = rateLimitStore.trackIPRequest(ip);

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', '10');
  res.setHeader('X-RateLimit-Remaining', result.remaining);

  if (!result.allowed) {
    res.setHeader('X-RateLimit-Reset', new Date(Date.now() + (result.retryAfter * 1000)).toISOString());
    res.setHeader('Retry-After', result.retryAfter);
    
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: result.retryAfter
    });
  }

  next();
};

/**
 * Account lockout check middleware
 * Checks if account is locked before allowing login attempt
 */
const checkAccountLockout = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next();
  }

  const lockStatus = rateLimitStore.isAccountLocked(email.toLowerCase());

  if (lockStatus.locked) {
    // Generic error message - don't reveal lockout reason
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  next();
};

/**
 * Track failed login attempt and implement progressive delay
 * Call this from the login controller when authentication fails
 */
const trackFailedLoginAttempt = async (email, user) => {
  const normalizedEmail = email.toLowerCase();
  const result = rateLimitStore.trackFailedLogin(normalizedEmail);

  console.log(`❌ Failed login attempt for ${normalizedEmail} (${result.attempts}/5)`);

  // Lock account after 5 failed attempts
  if (result.shouldLock) {
    rateLimitStore.lockAccount(normalizedEmail);
    
    // Send lockout notification email if user exists
    if (user) {
      try {
        await sendAccountLockoutEmail(user);
        console.log(`📧 Lockout notification sent to ${normalizedEmail}`);
      } catch (emailError) {
        console.error('Failed to send lockout email:', emailError.message);
      }
    }
  }

  return {
    attempts: result.attempts,
    locked: result.shouldLock,
    delay: result.delay
  };
};

/**
 * Reset failed attempts on successful login
 */
const resetLoginAttempts = (email) => {
  const normalizedEmail = email.toLowerCase();
  rateLimitStore.resetFailedAttempts(normalizedEmail);
  console.log(`✅ Login attempts reset for ${normalizedEmail}`);
};

/**
 * Get remaining attempts before lockout
 */
const getRemainingAttempts = (email) => {
  const normalizedEmail = email.toLowerCase();
  const currentAttempts = rateLimitStore.getAttemptCount(normalizedEmail);
  return Math.max(0, 5 - currentAttempts);
};

/**
 * Progressive delay utility
 * Waits for the calculated delay time before proceeding
 */
const applyProgressiveDelay = (delayMs) => {
  return new Promise(resolve => setTimeout(resolve, delayMs));
};

module.exports = {
  ipRateLimiter,
  checkAccountLockout,
  trackFailedLoginAttempt,
  resetLoginAttempts,
  getRemainingAttempts,
  applyProgressiveDelay,
  rateLimitStore // Export for testing purposes
};
