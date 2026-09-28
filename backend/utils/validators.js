/**
 * Email validation utility functions
 */

// Common disposable/temporary email domains to block
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'throwaway.email',
  'getnada.com',
  'temp-mail.org',
  'trashmail.com',
  'fakeinbox.com',
  'sharklasers.com'
];

/**
 * Validates email format using regex
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidEmailFormat = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // RFC 5322 simplified regex pattern
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Checks if email domain is from disposable email provider
 * @param {string} email - Email address to check
 * @returns {boolean} - True if disposable, false otherwise
 */
const isDisposableEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const domain = email.toLowerCase().split('@')[1];
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
};

/**
 * Normalizes email address (lowercase and trim)
 * @param {string} email - Email address to normalize
 * @returns {string} - Normalized email
 */
const normalizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return '';
  }
  return email.toLowerCase().trim();
};

/**
 * Comprehensive email validation
 * @param {string} email - Email address to validate
 * @param {object} options - Validation options
 * @param {boolean} options.checkDisposable - Check for disposable emails (default: true)
 * @param {number} options.maxLength - Maximum email length (default: 100)
 * @returns {object} - { valid: boolean, message: string, normalizedEmail: string }
 */
const validateEmail = (email, options = {}) => {
  const {
    checkDisposable = true,
    maxLength = 100
  } = options;

  // Check if email is provided
  if (!email) {
    return {
      valid: false,
      message: 'Email is required'
    };
  }

  // Normalize email
  const normalizedEmail = normalizeEmail(email);

  // Check format
  if (!isValidEmailFormat(normalizedEmail)) {
    return {
      valid: false,
      message: 'Please provide a valid email address'
    };
  }

  // Check length
  if (normalizedEmail.length > maxLength) {
    return {
      valid: false,
      message: `Email address must not exceed ${maxLength} characters`
    };
  }

  // Check for disposable email
  if (checkDisposable && isDisposableEmail(normalizedEmail)) {
    return {
      valid: false,
      message: 'Please use a valid email address (temporary emails are not allowed)'
    };
  }

  // Check for consecutive dots
  if (normalizedEmail.includes('..')) {
    return {
      valid: false,
      message: 'Email address contains invalid characters'
    };
  }

  // Check if email starts or ends with special characters
  const localPart = normalizedEmail.split('@')[0];
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return {
      valid: false,
      message: 'Email address format is invalid'
    };
  }

  return {
    valid: true,
    message: 'Email is valid',
    normalizedEmail
  };
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @param {object} options - Validation options
 * @returns {object} - { valid: boolean, message: string }
 */
const validatePassword = (password, options = {}) => {
  const {
    minLength = 6,
    requireUppercase = false,
    requireLowercase = false,
    requireNumbers = false,
    requireSpecialChars = false
  } = options;

  if (!password) {
    return {
      valid: false,
      message: 'Password is required'
    };
  }

  if (password.length < minLength) {
    return {
      valid: false,
      message: `Password must be at least ${minLength} characters long`
    };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }

  if (requireNumbers && !/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one number'
    };
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one special character'
    };
  }

  return {
    valid: true,
    message: 'Password is valid'
  };
};

/**
 * Validates phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {object} - { valid: boolean, message: string }
 */
const validatePhone = (phone) => {
  if (!phone) {
    return {
      valid: false,
      message: 'Phone number is required'
    };
  }

  // Remove spaces and special characters
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Check for 10-digit Indian phone number
  if (!/^[6-9][0-9]{9}$/.test(cleanPhone)) {
    return {
      valid: false,
      message: 'Please provide a valid 10-digit phone number'
    };
  }

  return {
    valid: true,
    message: 'Phone number is valid',
    cleanPhone
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  isValidEmailFormat,
  isDisposableEmail,
  normalizeEmail
};
