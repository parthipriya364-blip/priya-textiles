import api from './api';

export const createPaymentOrder = async (payload) => {
  const response = await api.post('/payments/create-order', payload);
  return response.data;
};

export const verifyPayment = async (payload) => {
  const response = await api.post('/payments/verify', payload);
  return response.data;
};

export const loadRazorpay = () => new Promise((resolve, reject) => {
  if (window.Razorpay) return resolve(window.Razorpay);
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(window.Razorpay);
  script.onerror = () => reject(new Error('Unable to load Razorpay checkout'));
  document.body.appendChild(script);
});
