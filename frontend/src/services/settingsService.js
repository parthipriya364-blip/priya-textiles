import axios from 'axios';
import { getApiUrl } from '../config';
import { getToken } from './authService';

const API_URL = getApiUrl('settings');

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor to include token
const getAxiosConfig = () => {
  const token = getToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// Get settings (Admin)
export const getSettings = async () => {
  try {
    const config = getAxiosConfig();
    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch settings' };
  }
};

// Get public settings
export const getPublicSettings = async () => {
  try {
    const response = await axios.get(`${API_URL}/public`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch public settings' };
  }
};

// Update settings (Admin)
export const updateSettings = async (settingsData) => {
  try {
    const config = getAxiosConfig();
    const response = await axios.put(API_URL, settingsData, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update settings' };
  }
};

// Update specific setting section (Admin)
export const updateSettingSection = async (section, data) => {
  try {
    const config = getAxiosConfig();
    const response = await axios.patch(`${API_URL}/${section}`, data, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update settings section' };
  }
};

// Reset settings to default (Admin)
export const resetSettings = async () => {
  try {
    const config = getAxiosConfig();
    const response = await axios.post(`${API_URL}/reset`, {}, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reset settings' };
  }
};

// Upload logo (Admin)
export const uploadLogo = async (file) => {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await axios.post(`${API_URL}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload logo' };
  }
};

// Delete logo (Admin)
export const deleteLogo = async () => {
  try {
    const config = getAxiosConfig();
    const response = await axios.delete(`${API_URL}/logo`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete logo' };
  }
};

export default {
  getSettings,
  getPublicSettings,
  updateSettings,
  updateSettingSection,
  resetSettings,
  uploadLogo,
  deleteLogo,
};
