import axios from 'axios';
import { getApiUrl } from '../config';

const API_URL = getApiUrl('cart');

// Get user's cart
export const getCart = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Get cart error:', error);
    throw error.response?.data || { message: 'Failed to fetch cart' };
  }
};

// Add item to cart
export const addToCart = async (productId, quantity = 1, size = 'Free Size') => {
  try {
    const response = await axios.post(`${API_URL}/items`, {
      productId,
      quantity,
      size,
    });
    return response.data;
  } catch (error) {
    console.error('Add to cart error:', error);
    throw error.response?.data || { message: 'Failed to add item to cart' };
  }
};

// Update cart item quantity
export const updateCartItem = async (itemId, quantity) => {
  try {
    const response = await axios.put(`${API_URL}/items/${itemId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error('Update cart error:', error);
    throw error.response?.data || { message: 'Failed to update cart' };
  }
};

// Remove item from cart
export const removeFromCart = async (itemId) => {
  try {
    const response = await axios.delete(`${API_URL}/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Remove from cart error:', error);
    throw error.response?.data || { message: 'Failed to remove item' };
  }
};

// Clear entire cart
export const clearCart = async () => {
  try {
    const response = await axios.delete(API_URL);
    return response.data;
  } catch (error) {
    console.error('Clear cart error:', error);
    throw error.response?.data || { message: 'Failed to clear cart' };
  }
};

// Sync local cart with database (on login)
export const syncCart = async (localItems) => {
  try {
    const response = await axios.post(`${API_URL}/sync`, { items: localItems });
    return response.data;
  } catch (error) {
    console.error('Sync cart error:', error);
    throw error.response?.data || { message: 'Failed to sync cart' };
  }
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
};
