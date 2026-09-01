import axios from 'axios';
import { getApiUrl } from '../config';
import { getToken } from './authService';

const API_URL = getApiUrl('payments');

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor to include token
const getAxiosConfig = () => {
  const token = getToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// Get Razorpay Key
export const getRazorpayKey = async () => {
  try {
    console.log('🔑 Requesting Razorpay key from backend...');
    const response = await axios.get(`${API_URL}/razorpay-key`);
    console.log('✅ Razorpay key received successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get Razorpay key:', error);
    throw error.response?.data || { message: 'Failed to get Razorpay key. Please check backend connection.' };
  }
};

// Create Razorpay Order
export const createRazorpayOrder = async (amount) => {
  try {
    console.log('📝 Creating Razorpay order for amount:', amount);
    const config = getAxiosConfig();
    const response = await axios.post(
      `${API_URL}/create-order`,
      { amount, currency: 'INR' },
      config
    );
    console.log('✅ Razorpay order created:', response.data.order.id);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to create Razorpay order:', error);
    throw error.response?.data || { message: 'Failed to create order. Please try again.' };
  }
};

// Verify Payment and Create Booking
export const verifyAndCreateBooking = async (paymentData) => {
  try {
    console.log('🔐 Verifying payment and creating booking...');
    const config = getAxiosConfig();
    const response = await axios.post(
      `${API_URL}/verify-and-book`,
      paymentData,
      config
    );
    console.log('✅ Payment verified, booking created:', response.data.booking._id);
    return response.data;
  } catch (error) {
    console.error('❌ Payment verification failed:', error);
    throw error.response?.data || { message: 'Payment verification failed. Please contact support.' };
  }
};

// Create COD Booking
export const createCODBooking = async (bookingData) => {
  try {
    const config = getAxiosConfig();
    const response = await axios.post(
      `${API_URL}/cod-booking`,
      bookingData,
      config
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create COD booking' };
  }
};

// Get User Bookings
export const getMyBookings = async () => {
  try {
    const config = getAxiosConfig();
    const response = await axios.get(`${API_URL}/my-bookings`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch bookings' };
  }
};

// Get Single Booking
export const getBooking = async (bookingId) => {
  try {
    const config = getAxiosConfig();
    const response = await axios.get(`${API_URL}/booking/${bookingId}`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch booking' };
  }
};

// Cancel Booking
export const cancelBooking = async (bookingId) => {
  try {
    const config = getAxiosConfig();
    const response = await axios.put(
      `${API_URL}/booking/${bookingId}/cancel`,
      {},
      config
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to cancel booking' };
  }
};

// Get All Bookings (Admin)
export const getAllBookings = async (filters = {}) => {
  try {
    const config = getAxiosConfig();
    const queryParams = new URLSearchParams(filters).toString();
    const response = await axios.get(
      `${API_URL}/bookings?${queryParams}`,
      config
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch all bookings' };
  }
};

// Update Booking Status (Admin)
export const updateBookingStatus = async (bookingId, statusData) => {
  try {
    const config = getAxiosConfig();
    const response = await axios.put(
      `${API_URL}/booking/${bookingId}/status`,
      statusData,
      config
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update booking status' };
  }
};

export default {
  getRazorpayKey,
  createRazorpayOrder,
  verifyAndCreateBooking,
  createCODBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
};
