export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isValidPhone = (value) => /^[0-9]{10}$/.test(value.replace(/\D/g, ""));

export const isValidPincode = (value) => /^[0-9]{6}$/.test(value);

export const isNotEmpty = (value) => value.trim().length > 0;

export const isValidPassword = (value) => value.length >= 6;
