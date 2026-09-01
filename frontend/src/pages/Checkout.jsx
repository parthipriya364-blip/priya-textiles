import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { getStoredUser } from "../services/authService";
import {
  getRazorpayKey,
  createRazorpayOrder,
  verifyAndCreateBooking,
  createCODBooking,
} from "../services/paymentService";
import { FaCreditCard, FaMobileAlt, FaMoneyBillWave, FaLock } from "react-icons/fa";
import "./style/Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { showToast } = useToast();
  const user = getStoredUser();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState({
    card: true,
    upi: true,
    cod: true,
  });
  
  const [customerData, setCustomerData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    pincode: user?.address?.zipCode || "",
  });

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + shipping;

  useEffect(() => {
    if (items.length === 0) {
      showToast("Your cart is empty", "error");
      navigate("/cart");
    }

    // Calculate available payment methods based on cart items
    // All items must support a payment method for it to be available
    const methods = {
      card: true,
      upi: true,
      cod: true,
    };

    items.forEach(item => {
      // If product has payment methods defined, check them
      if (item.paymentMethods) {
        if (!item.paymentMethods.card) methods.card = false;
        if (!item.paymentMethods.upi) methods.upi = false;
        if (!item.paymentMethods.cod) methods.cod = false;
      }
    });

    setAvailablePaymentMethods(methods);

    // If current payment method is not available, switch to first available
    if (!methods[paymentMethod]) {
      if (methods.card) setPaymentMethod("card");
      else if (methods.upi) setPaymentMethod("upi");
      else if (methods.cod) setPaymentMethod("cod");
    }

    // Global error handler to suppress Razorpay tracking pixel errors
    const suppressImageErrors = (event) => {
      if (event.target?.tagName === 'IMG' && event.target?.src?.includes('localhost:')) {
        event.stopPropagation();
        event.preventDefault();
      }
    };

    window.addEventListener('error', suppressImageErrors, true);

    return () => {
      window.removeEventListener('error', suppressImageErrors, true);
    };
  }, [items, navigate, showToast, paymentMethod]);

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Check if already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        // Suppress Razorpay's localhost image errors
        if (window.Image) {
          const OriginalImage = window.Image;
          window.Image = function() {
            const img = new OriginalImage();
            const originalSrc = Object.getOwnPropertyDescriptor(Image.prototype, 'src');
            
            Object.defineProperty(img, 'src', {
              set: function(value) {
                // Suppress localhost:XXXX/XXXXX.png errors
                if (value && value.includes('localhost:') && value.includes('.png')) {
                  img.onerror = () => {}; // Silent fail
                }
                originalSrc.set.call(this, value);
              },
              get: function() {
                return originalSrc.get.call(this);
              }
            });
            
            return img;
          };
        }
        
        resolve(true);
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInputChange = (e) => {
    setCustomerData({
      ...customerData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const { name, email, phone, address, city, state, pincode } = customerData;

    if (!name || !email || !phone || !address || !city || !state || !pincode) {
      showToast("Please fill in all required fields", "error");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address", "error");
      return false;
    }

    // Phone validation
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      showToast("Please enter a valid 10-digit phone number", "error");
      return false;
    }

    // Pincode validation
    if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      showToast("Please enter a valid 6-digit pincode", "error");
      return false;
    }

    return true;
  };

  const handleRazorpayPayment = async () => {
    try {
      setLoading(true);
      console.log('🚀 Starting Razorpay payment process...');
      console.log('💳 Payment method:', paymentMethod);

      // Suppress Razorpay console warnings (they don't affect functionality)
      const originalConsoleError = console.error;
      console.error = (...args) => {
        const errorStr = args.join(' ');
        // Filter out known Razorpay noise
        if (
          errorStr.includes('devicemotion') ||
          errorStr.includes('accelerometer') ||
          errorStr.includes('deviceorientation') ||
          errorStr.includes('Mixed Content') ||
          errorStr.includes('sardine.ai') ||
          errorStr.includes('sentry-cdn')
        ) {
          return; // Ignore these warnings
        }
        originalConsoleError.apply(console, args);
      };

      // Load Razorpay script
      console.log('📦 Loading Razorpay script...');
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        console.error('❌ Razorpay script failed to load');
        console.error = originalConsoleError; // Restore
        showToast("Failed to load Razorpay. Please check your internet connection.", "error");
        setLoading(false);
        return;
      }
      console.log('✅ Razorpay script loaded successfully');

      // Get Razorpay key
      console.log('🔑 Fetching Razorpay key...');
      const keyData = await getRazorpayKey();
      const razorpayKey = keyData.key;
      console.log('✅ Razorpay key received:', razorpayKey);

      // Create order
      console.log('📝 Creating Razorpay order for amount:', total);
      const orderData = await createRazorpayOrder(total);
      const { order } = orderData;
      console.log('✅ Order created successfully:', order.id);

      // Prepare booking data
      const bookingData = {
        items: items.map((item) => ({
          product: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.qty,
          size: item.size || "Free Size",
        })),
        customer: customerData,
        subtotal,
        shipping,
        total,
        paymentMethod,
      };

      // Razorpay options
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "Priya Textiles",
        description: "Purchase from Priya Textiles",
        order_id: order.id,
        handler: async function (response) {
          console.log('✅ Payment successful!');
          console.log('   Order ID:', response.razorpay_order_id);
          console.log('   Payment ID:', response.razorpay_payment_id);
          
          console.error = originalConsoleError; // Restore
          try {
            console.log('🔐 Verifying payment signature...');
            // Verify payment and create booking
            const result = await verifyAndCreateBooking({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingData,
            });

            if (result.success) {
              console.log('✅ Booking confirmed:', result.booking._id);
              showToast("Payment successful! Order placed.", "success");
              clearCart();
              navigate(`/order-success/${result.booking._id}`);
            }
          } catch (error) {
            console.error('❌ Payment verification failed:', error);
            showToast(error.message || "Payment verification failed", "error");
          }
        },
        prefill: {
          name: customerData.name,
          email: customerData.email,
          contact: customerData.phone,
        },
        notes: {
          address: customerData.address,
        },
        theme: {
          color: "#8B0000",
        },
        modal: {
          ondismiss: function () {
            console.warn('⚠️ Payment modal dismissed by user');
            console.error = originalConsoleError; // Restore
            setLoading(false);
            showToast("Payment cancelled", "info");
          },
        },
      };

      // Configure UPI-specific settings when UPI is selected
      if (paymentMethod === "upi") {
        console.log('💳 Configuring UPI payment options...');
        
        // In test mode, Razorpay requires specific configuration for UPI
        // Remove the method restriction and let Razorpay handle payment methods
        // Test mode will show test UPI options automatically
        
        console.log('✅ UPI will be available in Razorpay payment modal');
      }

      console.log('🎯 Opening Razorpay modal...');
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      console.log('✅ Razorpay modal opened successfully');
      
      // Restore console after a delay
      setTimeout(() => {
        console.error = originalConsoleError;
      }, 2000);
      
      setLoading(false);
    } catch (error) {
      console.error("❌ Razorpay payment error:", error);
      console.error("Error details:", error.message);
      showToast(error.message || "Payment failed. Please try again.", "error");
      setLoading(false);
    }
  };

  const handleCODPayment = async () => {
    try {
      setLoading(true);

      const bookingData = {
        items: items.map((item) => ({
          product: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.qty,
          size: item.size || "Free Size",
        })),
        customer: customerData,
        subtotal,
        shipping,
        total,
        paymentMethod: "cod",
      };

      const result = await createCODBooking(bookingData);

      if (result.success) {
        showToast("Order placed successfully with COD!", "success");
        clearCart();
        navigate(`/order-success/${result.booking._id}`);
      }
    } catch (error) {
      showToast(error.message || "Failed to place order", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (paymentMethod === "cod") {
      await handleCODPayment();
    } else {
      await handleRazorpayPayment();
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your purchase</p>
        </div>

        <div className="checkout-content">
          {/* Customer Information Form */}
          <div className="checkout-form-section">
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-section">
                <h2>Customer Information</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={customerData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={customerData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={customerData.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h2>Shipping Address</h2>
                <div className="form-group">
                  <label htmlFor="address">Street Address *</label>
                  <textarea
                    id="address"
                    name="address"
                    value={customerData.address}
                    onChange={handleInputChange}
                    placeholder="House number, street name, landmark"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={customerData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="state">State *</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={customerData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="pincode">Pincode *</label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={customerData.pincode}
                      onChange={handleInputChange}
                      placeholder="6-digit pincode"
                      maxLength="6"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h2>Payment Method</h2>
                <div className="payment-methods">
                  {availablePaymentMethods.card && (
                    <label className={`payment-option ${paymentMethod === "card" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="payment-content">
                        <FaCreditCard />
                        <span>Credit / Debit Card</span>
                      </div>
                    </label>
                  )}

                  {availablePaymentMethods.upi && (
                    <label className={`payment-option ${paymentMethod === "upi" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={paymentMethod === "upi"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="payment-content">
                        <FaMobileAlt />
                        <span>UPI</span>
                      </div>
                    </label>
                  )}

                  {availablePaymentMethods.cod && (
                    <label className={`payment-option ${paymentMethod === "cod" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="payment-content">
                        <FaMoneyBillWave />
                        <span>Cash on Delivery</span>
                      </div>
                    </label>
                  )}
                </div>

                <div className="secure-payment">
                  <FaLock />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block checkout-btn"
                disabled={loading}
              >
                {loading ? "Processing..." : `Place Order - ₹${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <div className="order-summary">
              <h2>Order Summary</h2>
              
              <div className="summary-items">
                {items.map((item) => (
                  <div key={item.lineId} className="summary-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>Qty: {item.qty}</p>
                    </div>
                    <div className="item-price">
                      ₹{(item.price * item.qty).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {subtotal < 1000 && (
                <div className="shipping-note">
                  <p>Add ₹{(1000 - subtotal).toFixed(2)} more for FREE shipping!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
