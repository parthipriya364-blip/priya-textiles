import axios from 'axios';
import { getApiUrl } from '../config';
import { getToken } from './authService';

const API_URL = getApiUrl('reviews');

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor to include token
const getAxiosConfig = () => {
  const token = getToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// Create a review
export const createReview = async (reviewData) => {
  try {
    const config = getAxiosConfig();
    const response = await axios.post(API_URL, reviewData, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create review' };
  }
};

// Get all reviews (Admin)
export const getAllReviews = async (filters = {}) => {
  try {
    const config = getAxiosConfig();
    const queryParams = new URLSearchParams(filters).toString();
    const response = await axios.get(
      `${API_URL}?${queryParams}`,
      config
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch reviews' };
  }
};

// Get reviews for a product
export const getProductReviews = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/product/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch product reviews' };
  }
};

// Get user's reviews
export const getMyReviews = async () => {
  try {
    const config = getAxiosConfig();
    const response = await axios.get(`${API_URL}/my-reviews`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch your reviews' };
  }
};

// Check if user can review products in a booking
export const canReviewBooking = async (bookingId) => {
  try {
    const config = getAxiosConfig();
    const response = await axios.get(`${API_URL}/can-review/${bookingId}`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to check review status' };
  }
};

// Delete review (Admin)
export const deleteReview = async (reviewId) => {
  try {
    const config = getAxiosConfig();
    const response = await axios.delete(`${API_URL}/${reviewId}`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete review' };
  }
};

export default {
  createReview,
  getAllReviews,
  getProductReviews,
  getMyReviews,
  canReviewBooking,
  deleteReview,
};
