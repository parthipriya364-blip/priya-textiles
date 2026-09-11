import axios from 'axios';
import { getApiUrl } from '../config';

const STORAGE_KEY = 'priya-textiles-user';
const TOKEN_KEY = 'priya-textiles-token';

// API Base URL
const API_URL = getApiUrl('auth');

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor to include token
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Set auth token
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem(TOKEN_KEY);
  }
};

// Get stored token
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Get stored user
export const getStoredUser = () => {
  try {
    const user = localStorage.getItem(STORAGE_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
};

// Clear auth data
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(STORAGE_KEY);
  delete axios.defaults.headers.common['Authorization'];
};

// User Signup
export const signup = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, userData);
    
    if (response.data.success && response.data.token) {
      setAuthToken(response.data.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data.user));
      // Dispatch custom event to notify components
      window.dispatchEvent(new Event('userChanged'));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Signup failed. Please try again.' };
  }
};

// User Login
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    
    if (response.data.success && response.data.token) {
      setAuthToken(response.data.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data.user));
      // Dispatch custom event to notify components
      window.dispatchEvent(new Event('userChanged'));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed. Please try again.' };
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/me`);
    
    if (response.data.success) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user data.' };
  }
};

// Get registered users for the admin dashboard
export const getUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch users.' };
  }
};

// Update password
export const updatePassword = async (passwords) => {
  try {
    const response = await axios.put(`${API_URL}/updatepassword`, passwords);
    
    if (response.data.success && response.data.token) {
      setAuthToken(response.data.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update password.' };
  }
};

// Update profile
export const updateProfile = async (profileData) => {
  try {
    const response = await axios.put(`${API_URL}/updateprofile`, profileData);
    
    if (response.data.success) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data.user));
      // Dispatch custom event to notify components
      window.dispatchEvent(new Event('userChanged'));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update profile.' };
  }
};

// Logout
export const logout = async () => {
  try {
    await axios.post(`${API_URL}/logout`);
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuth();
    // Also clear the old 'user' key if it exists
    localStorage.removeItem('user');
    // Dispatch custom event to notify components
    window.dispatchEvent(new Event('userChanged'));
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Check if user is admin
export const isAdmin = () => {
  const user = getStoredUser();
  return user?.role === 'admin';
};

// Initialize auth on app load
export const initAuth = () => {
  const token = getToken();
  if (token) {
    setAuthToken(token);
  }
};

export default {
  signup,
  login,
  logout,
  getCurrentUser,
  getUsers,
  updatePassword,
  updateProfile,
  isAuthenticated,
  isAdmin,
  getToken,
  getStoredUser,
  initAuth
};
