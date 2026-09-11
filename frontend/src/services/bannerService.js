import axios from 'axios';
import { getApiUrl } from '../config';

const API_URL = getApiUrl('banners');

// Get all banners
export const getBanners = async (enabledOnly = false) => {
  try {
    const url = enabledOnly ? `${API_URL}?enabled=true` : API_URL;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Get banners error:', error);
    throw error.response?.data || { message: 'Failed to fetch banners' };
  }
};

// Get single banner
export const getBanner = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get banner error:', error);
    throw error.response?.data || { message: 'Failed to fetch banner' };
  }
};

// Create banner
export const createBanner = async (bannerData) => {
  try {
    const formData = new FormData();
    
    if (bannerData.link) formData.append('link', bannerData.link);
    if (bannerData.image) formData.append('image', bannerData.image);

    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Create banner error:', error);
    throw error.response?.data || { message: 'Failed to create banner' };
  }
};

// Update banner
export const updateBanner = async (id, bannerData) => {
  try {
    const formData = new FormData();
    
    if (bannerData.link !== undefined) formData.append('link', bannerData.link);
    if (bannerData.enabled !== undefined) formData.append('enabled', bannerData.enabled);
    if (bannerData.image) formData.append('image', bannerData.image);

    const response = await axios.put(`${API_URL}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Update banner error:', error);
    throw error.response?.data || { message: 'Failed to update banner' };
  }
};

// Delete banner
export const deleteBanner = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete banner error:', error);
    throw error.response?.data || { message: 'Failed to delete banner' };
  }
};

// Toggle banner enabled status
export const toggleBannerEnabled = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/${id}/toggle-enabled`);
    return response.data;
  } catch (error) {
    console.error('Toggle banner error:', error);
    throw error.response?.data || { message: 'Failed to toggle banner status' };
  }
};

// Reorder banner (up or down)
export const reorderBanner = async (id, direction) => {
  try {
    const response = await axios.put(`${API_URL}/${id}/reorder`, { direction });
    return response.data;
  } catch (error) {
    console.error('Reorder banner error:', error);
    throw error.response?.data || { message: 'Failed to reorder banner' };
  }
};

// Bulk reorder banners
export const reorderBannersB = async (banners) => {
  try {
    const response = await axios.put(`${API_URL}/reorder-bulk`, { banners });
    return response.data;
  } catch (error) {
    console.error('Bulk reorder error:', error);
    throw error.response?.data || { message: 'Failed to reorder banners' };
  }
};

export default {
  getBanners,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerEnabled,
  reorderBanner,
  reorderBannersB,
};
