import axios from 'axios';
import { getApiUrl } from '../config';
import { getToken } from './authService';

const API_URL = getApiUrl();

// Configure axios to include auth token
const getAuthHeaders = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ============ PRODUCTS ============

// Get all products with filters
export const getProducts = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const url = params ? `${API_URL}/products?${params}` : `${API_URL}/products`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch products' };
  }
};

// Get single product
export const getProduct = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch product' };
  }
};

// Create product
export const createProduct = async (formData) => {
  try {
    const response = await axios.post(
      `${API_URL}/products`,
      formData,
      {
        ...getAuthHeaders(),
        headers: {
          ...getAuthHeaders().headers,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create product' };
  }
};

// Update product
export const updateProduct = async (id, formData) => {
  try {
    const response = await axios.put(
      `${API_URL}/products/${id}`,
      formData,
      {
        ...getAuthHeaders(),
        headers: {
          ...getAuthHeaders().headers,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update product' };
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/products/${id}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete product' };
  }
};

// Toggle featured status
export const toggleProductFeatured = async (id) => {
  try {
    const response = await axios.put(
      `${API_URL}/products/${id}/toggle-featured`,
      {},
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to toggle featured status' };
  }
};

// Toggle active status
export const toggleProductActive = async (id) => {
  try {
    const response = await axios.put(
      `${API_URL}/products/${id}/toggle-active`,
      {},
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to toggle active status' };
  }
};

export default {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductFeatured,
  toggleProductActive,
};
