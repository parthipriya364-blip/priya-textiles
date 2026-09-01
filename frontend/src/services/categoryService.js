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

// ============ CATEGORIES ============

// Get all categories
export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch categories' };
  }
};

// Get single category
export const getCategory = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch category' };
  }
};

// Create category
export const createCategory = async (formData) => {
  try {
    const response = await axios.post(
      `${API_URL}/categories`,
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
    throw error.response?.data || { message: 'Failed to create category' };
  }
};

// Update category
export const updateCategory = async (id, formData) => {
  try {
    const response = await axios.put(
      `${API_URL}/categories/${id}`,
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
    throw error.response?.data || { message: 'Failed to update category' };
  }
};

// Delete category
export const deleteCategory = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/categories/${id}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete category' };
  }
};

// Initialize default categories
export const initializeCategories = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/categories/init`,
      {},
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to initialize categories' };
  }
};

// ============ SUBCATEGORIES ============

// Get all subcategories or by category
export const getSubCategories = async (category = null) => {
  try {
    const url = category 
      ? `${API_URL}/subcategories?category=${category}`
      : `${API_URL}/subcategories`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch subcategories' };
  }
};

// Get single subcategory
export const getSubCategory = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/subcategories/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch subcategory' };
  }
};

// Create subcategory
export const createSubCategory = async (formData) => {
  try {
    const response = await axios.post(
      `${API_URL}/subcategories`,
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
    throw error.response?.data || { message: 'Failed to create subcategory' };
  }
};

// Update subcategory
export const updateSubCategory = async (id, formData) => {
  try {
    const response = await axios.put(
      `${API_URL}/subcategories/${id}`,
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
    throw error.response?.data || { message: 'Failed to update subcategory' };
  }
};

// Delete subcategory
export const deleteSubCategory = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/subcategories/${id}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete subcategory' };
  }
};

// Reorder subcategory
export const reorderSubCategory = async (id, direction) => {
  try {
    const response = await axios.put(
      `${API_URL}/subcategories/${id}/reorder`,
      { direction },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reorder subcategory' };
  }
};

// Toggle subcategory status
export const toggleSubCategoryStatus = async (id) => {
  try {
    const response = await axios.put(
      `${API_URL}/subcategories/${id}/toggle`,
      {},
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to toggle subcategory status' };
  }
};

export default {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  initializeCategories,
  getSubCategories,
  getSubCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  reorderSubCategory,
  toggleSubCategoryStatus,
};
