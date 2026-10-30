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
import { FaCreditCard, FaMobileAlt, FaMoneyBillWave, FaLock, FaMapMarkedAlt } from "react-icons/fa";
import LocationPicker from "../components/LocationPicker";
import { 
  TAMIL_NADU_DISTRICTS, 
  KERALA_DISTRICTS,
  KARNATAKA_CITIES,
  ANDHRA_PRADESH_CITIES,
  TELANGANA_CITIES,
  PUDUCHERRY_DISTRICTS,
  LAKSHADWEEP_DISTRICTS,
  DELHI_CITIES,
  UTTAR_PRADESH_CITIES,
  RAJASTHAN_CITIES,
  PUNJAB_CITIES,
  HARYANA_CITIES,
  HIMACHAL_PRADESH_CITIES,
  UTTARAKHAND_CITIES,
  JAMMU_KASHMIR_CITIES,
  LADAKH_CITIES,
  CHANDIGARH_AREAS,
  MAHARASHTRA_CITIES,
  GUJARAT_CITIES,
  GOA_DISTRICTS,
  DADRA_NAGAR_HAVELI_DAMAN_DIU_AREAS,
  CHHATTISGARH_CITIES,
  MADHYA_PRADESH_CITIES,
  ANDAMAN_NICOBAR_ISLANDS,
  BIHAR_CITIES,
  JHARKHAND_CITIES,
  ODISHA_CITIES,
  WEST_BENGAL_CITIES,
  SIKKIM_DISTRICTS,
  ARUNACHAL_PRADESH_CITIES,
  ASSAM_CITIES,
  MANIPUR_CITIES,
  MEGHALAYA_CITIES,
  MIZORAM_CITIES,
  NAGALAND_CITIES,
  TRIPURA_CITIES,
  calculateShipping 
} from "../utils/shippingConfig";
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
    country: user?.address?.country || "India",
    pincode: user?.address?.zipCode || "",
  });

  const [showOtherCityInput, setShowOtherCityInput] = useState(false);
  const [showOtherStateInput, setShowOtherStateInput] = useState(false);
  const [showOtherCountryInput, setShowOtherCountryInput] = useState(false);

  // Location picker state
  const [showMap, setShowMap] = useState(false);
  const [locationData, setLocationData] = useState(null);


  // Calculate shipping dynamically based on city, state, and country
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = calculateShipping(customerData.city, customerData.state, customerData.country);
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
    const { name, value } = e.target;
    
    // Handle country change - reset state and city when country changes
    if (name === "country") {
      if (value === "Other") {
        setShowOtherCountryInput(true);
        setCustomerData({
          ...customerData,
          country: "", // Clear country to allow manual input
          state: "", // Reset state when country changes
          city: "", // Reset city when country changes
        });
        setShowOtherStateInput(false);
        setShowOtherCityInput(false);
      } else {
        setShowOtherCountryInput(false);
        setCustomerData({
          ...customerData,
          country: value,
          state: "", // Reset state when country changes
          city: "", // Reset city when country changes
        });
        setShowOtherStateInput(false);
        setShowOtherCityInput(false);
      }
    }
    // Handle state change - reset city when state changes
    else if (name === "state") {
      if (value === "Other") {
        setShowOtherStateInput(true);
        setCustomerData({
          ...customerData,
          state: "", // Clear state to allow manual input
          city: "", // Reset city when state changes
        });
        setShowOtherCityInput(false);
      } else {
        setShowOtherStateInput(false);
        setCustomerData({
          ...customerData,
          state: value,
          city: "", // Reset city when state changes
        });
        setShowOtherCityInput(false);
      }
    } 
    // Handle city change - check if "Other" is selected
    else if (name === "city") {
      if (value === "Other") {
        setShowOtherCityInput(true);
        setCustomerData({
          ...customerData,
          city: "", // Clear city to allow manual input
        });
      } else {
        setShowOtherCityInput(false);
        setCustomerData({
          ...customerData,
          city: value,
        });
      }
    } 
    else {
      setCustomerData({
        ...customerData,
        [name]: value,
      });
    }
  };

  // Handle location selection from Google Maps
  const handleLocationSelect = (location) => {
    setLocationData(location);
    setCustomerData({
      ...customerData,
      address: location.address,
      city: location.city,
      state: location.state,
      country: location.country,
      pincode: location.pincode,
    });
    // Optionally close map after selection
    // setShowMap(false);
  };

  const validateForm = () => {
    const { name, email, phone, address, city, state, country, pincode } = customerData;

    // Basic required fields for all customers
    if (!name || !email || !phone || !address || !city || !country || !pincode) {
      showToast("Please fill in all required fields", "error");
      return false;
    }

    // State is required only for India
    if (country === "India" && !state) {
      showToast("Please select or enter your state", "error");
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
        customer: {
          ...customerData,
          // Include Google Maps location if available
          location: locationData ? {
            lat: locationData.lat,
            lng: locationData.lng,
            formattedAddress: locationData.formattedAddress
          } : undefined
        },
        subtotal,
        shipping,
        total,
        paymentMethod,
      };

      // Create order using the cart; the backend calculates the trusted total.
      const orderData = await createRazorpayOrder(bookingData);
      const { order } = orderData;
      console.log('✅ Order created successfully:', order.id);

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
        customer: {
          ...customerData,
          // Include Google Maps location if available
          location: locationData ? {
            lat: locationData.lat,
            lng: locationData.lng,
            formattedAddress: locationData.formattedAddress
          } : undefined
        },
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

              {/* Google Maps Location Picker */}
              <div className="form-section">
                <div className="map-section-header">
                  <h2>📍 Delivery Location</h2>
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="btn-toggle-map"
                  >
                    <FaMapMarkedAlt />
                    {showMap ? 'Hide Map' : 'Choose on Map'}
                  </button>
                </div>

                {showMap && (
                  <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    initialLocation={locationData}
                    onClose={() => setShowMap(false)}
                  />
                )}
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
                    <label htmlFor="country">Country *</label>
                    <select
                      id="country"
                      name="country"
                      value={showOtherCountryInput ? "Other" : customerData.country}
                      onChange={handleInputChange}
                      required={!showOtherCountryInput}
                    >
                      <option value="">Select Country</option>
                      <option value="India">India</option>
                      <optgroup label="Popular Countries">
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
                        <option value="Qatar">Qatar</option>
                        <option value="Kuwait">Kuwait</option>
                        <option value="Oman">Oman</option>
                        <option value="Bahrain">Bahrain</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Malaysia">Malaysia</option>
                      </optgroup>
                      <optgroup label="Europe">
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Italy">Italy</option>
                        <option value="Spain">Spain</option>
                        <option value="Netherlands">Netherlands</option>
                        <option value="Switzerland">Switzerland</option>
                        <option value="Belgium">Belgium</option>
                        <option value="Sweden">Sweden</option>
                        <option value="Norway">Norway</option>
                        <option value="Denmark">Denmark</option>
                        <option value="Ireland">Ireland</option>
                        <option value="Portugal">Portugal</option>
                      </optgroup>
                      <optgroup label="Asia Pacific">
                        <option value="Japan">Japan</option>
                        <option value="South Korea">South Korea</option>
                        <option value="China">China</option>
                        <option value="Hong Kong">Hong Kong</option>
                        <option value="Thailand">Thailand</option>
                        <option value="Indonesia">Indonesia</option>
                        <option value="Philippines">Philippines</option>
                        <option value="Vietnam">Vietnam</option>
                        <option value="New Zealand">New Zealand</option>
                      </optgroup>
                      <optgroup label="South Asia">
                        <option value="Pakistan">Pakistan</option>
                        <option value="Bangladesh">Bangladesh</option>
                        <option value="Sri Lanka">Sri Lanka</option>
                        <option value="Nepal">Nepal</option>
                        <option value="Maldives">Maldives</option>
                      </optgroup>
                      <optgroup label="Africa">
                        <option value="South Africa">South Africa</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Egypt">Egypt</option>
                        <option value="Morocco">Morocco</option>
                      </optgroup>
                      <optgroup label="Americas">
                        <option value="Mexico">Mexico</option>
                        <option value="Brazil">Brazil</option>
                        <option value="Argentina">Argentina</option>
                        <option value="Chile">Chile</option>
                      </optgroup>
                      <option value="Other">Other (Enter manually - Free Shipping)</option>
                    </select>
                    {showOtherCountryInput && (
                      <input
                        type="text"
                        id="country-other"
                        name="country"
                        value={customerData.country}
                        onChange={handleInputChange}
                        placeholder="Enter your country name"
                        required
                        style={{ marginTop: "10px" }}
                      />
                    )}
                  </div>

                  {/* State field - Only show for India */}
                  {customerData.country === "India" && (
                  <div className="form-group">
                    <label htmlFor="state">State *</label>
                    {customerData.country === "India" ? (
                      <>
                        <select
                          id="state"
                          name="state"
                          value={showOtherStateInput ? "Other" : customerData.state}
                          onChange={handleInputChange}
                          required={!showOtherStateInput}
                        >
                          <option value="">Select State</option>
                      <optgroup label="Tamil Nadu">
                        <option value="Tamil Nadu">Tamil Nadu (₹40)</option>
                      </optgroup>
                      <optgroup label="South India - ₹90">
                        <option value="Kerala">Kerala</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Puducherry">Puducherry</option>
                        <option value="Lakshadweep">Lakshadweep</option>
                      </optgroup>
                      <optgroup label="North India - ₹200">
                        <option value="Delhi">Delhi</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                        <option value="Ladakh">Ladakh</option>
                        <option value="Chandigarh">Chandigarh</option>
                      </optgroup>
                      <optgroup label="Other States - ₹200">
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Goa">Goa</option>
                        <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Odisha">Odisha</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Sikkim">Sikkim</option>
                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                        <option value="Assam">Assam</option>
                        <option value="Manipur">Manipur</option>
                        <option value="Meghalaya">Meghalaya</option>
                        <option value="Mizoram">Mizoram</option>
                        <option value="Nagaland">Nagaland</option>
                        <option value="Tripura">Tripura</option>
                        <option value="Other">Other (Enter manually)</option>
                      </optgroup>
                    </select>
                    {showOtherStateInput && (
                      <input
                        type="text"
                        id="state-other"
                        name="state"
                        value={customerData.state}
                        onChange={handleInputChange}
                        placeholder="Enter your state name"
                        required
                        style={{ marginTop: "10px" }}
                      />
                    )}
                      </>
                    ) : (
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={customerData.state}
                        onChange={handleInputChange}
                        placeholder="Enter State/Province"
                        required
                      />
                    )}
                  </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="city">City / District *</label>
                    {customerData.country === "India" ? (
                      customerData.state === "Tamil Nadu" ? (
                      <>
                        <select
                          id="city"
                          name="city"
                          value={showOtherCityInput ? "Other" : customerData.city}
                          onChange={handleInputChange}
                          required={!showOtherCityInput}
                        >
                          <option value="">Select District</option>
                          {TAMIL_NADU_DISTRICTS.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                          <option value="Other">Other (Enter manually)</option>
                        </select>
                        {showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city/district name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
                    ) : customerData.state === "Kerala" ? (
                      <>
                        <select
                          id="city"
                          name="city"
                          value={showOtherCityInput ? "Other" : customerData.city}
                          onChange={handleInputChange}
                          required={!showOtherCityInput}
                        >
                          <option value="">Select District</option>
                          {KERALA_DISTRICTS.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                          <option value="Other">Other (Enter manually)</option>
                        </select>
                        {showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city/district name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
                    ) : customerData.state === "Karnataka" ? (
                      <>
                        <select
                          id="city"
                          name="city"
                          value={showOtherCityInput ? "Other" : customerData.city}
                          onChange={handleInputChange}
                          required={!showOtherCityInput}
                        >
                          <option value="">Select City</option>
                          {KARNATAKA_CITIES.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                          <option value="Other">Other (Enter manually)</option>
                        </select>
                        {showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
                    ) : customerData.state === "Andhra Pradesh" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {ANDHRA_PRADESH_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>{showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
                    ) : customerData.state === "Telangana" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {TELANGANA_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>
                    {showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
) : customerData.state === "Puducherry" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select District</option>
                        {PUDUCHERRY_DISTRICTS.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>{showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
                    ) : customerData.state === "Lakshadweep" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select District</option>
                        {LAKSHADWEEP_DISTRICTS.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>
                    {showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
) : customerData.state === "Delhi" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select Area</option>
                        {DELHI_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>{showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
                    ) : customerData.state === "Uttar Pradesh" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {UTTAR_PRADESH_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>
                    {showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
) : customerData.state === "Rajasthan" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {RAJASTHAN_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>{showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
                    ) : customerData.state === "Punjab" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {PUNJAB_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>
                    {showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
) : customerData.state === "Haryana" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {HARYANA_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>{showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
                    ) : customerData.state === "Himachal Pradesh" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {HIMACHAL_PRADESH_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>
                    {showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
) : customerData.state === "Uttarakhand" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {UTTARAKHAND_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>{showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
                    ) : customerData.state === "Jammu and Kashmir" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {JAMMU_KASHMIR_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>
                    {showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
) : customerData.state === "Ladakh" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {LADAKH_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>{showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
                    ) : customerData.state === "Chandigarh" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select Area</option>
                        {CHANDIGARH_AREAS.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>
                    {showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
) : customerData.state === "Maharashtra" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {MAHARASHTRA_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>{showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
                    ) : customerData.state === "Gujarat" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {GUJARAT_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>
                    {showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
) : customerData.state === "Goa" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select District</option>
                        {GOA_DISTRICTS.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>{showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
                    ) : customerData.state === "Dadra and Nagar Haveli and Daman and Diu" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select Area</option>
                        {DADRA_NAGAR_HAVELI_DAMAN_DIU_AREAS.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>
                    {showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
) : customerData.state === "Chhattisgarh" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {CHHATTISGARH_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>{showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
                    ) : customerData.state === "Madhya Pradesh" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {MADHYA_PRADESH_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>
                    {showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
) : customerData.state === "Andaman and Nicobar Islands" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select Island</option>
                        {ANDAMAN_NICOBAR_ISLANDS.map((island) => (
                          <option key={island} value={island}>
                            {island}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>{showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
                    ) : customerData.state === "Bihar" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {BIHAR_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>
                    {showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
) : customerData.state === "Jharkhand" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {JHARKHAND_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>{showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
                    ) : customerData.state === "Odisha" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {ODISHA_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>
                    {showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
) : customerData.state === "West Bengal" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {WEST_BENGAL_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>{showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
                    ) : customerData.state === "Sikkim" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select District</option>
                        {SIKKIM_DISTRICTS.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>
                    {showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
) : customerData.state === "Arunachal Pradesh" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {ARUNACHAL_PRADESH_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>{showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
                    ) : customerData.state === "Assam" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {ASSAM_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>
                    {showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
) : customerData.state === "Manipur" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {MANIPUR_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>{showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
                    ) : customerData.state === "Meghalaya" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {MEGHALAYA_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>
                    {showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
) : customerData.state === "Mizoram" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {MIZORAM_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>{showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
                    ) : customerData.state === "Nagaland" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {NAGALAND_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>
                    {showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
) : customerData.state === "Tripura" ? (
                      <><select
                        id="city"
                        name="city"
                        value={showOtherCityInput ? "Other" : customerData.city}
                        onChange={handleInputChange}
                        required={!showOtherCityInput}
                      >
                        <option value="">Select City</option>
                        {TRIPURA_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      <option value="Other">Other (Enter manually)</option></select>{showOtherCityInput && (
                          <input
                            type="text"
                            id="city-other"
                            name="city"
                            value={customerData.city}
                            onChange={handleInputChange}
                            placeholder="Enter your city name"
                            required
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
                    ) : (
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={customerData.city}
                        onChange={handleInputChange}
                        placeholder="Enter City"
                        required
                      />
                    )
                    ) : (
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={customerData.city}
                        onChange={handleInputChange}
                        placeholder="Enter City"
                        required
                      />
                    )}
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
                
                {/* Shipping charge indicator */}
                <div className="shipping-info">
                  <p>
                    📦 Shipping Charge: <strong>{shipping === 0 ? "FREE" : `₹${shipping}`}</strong>
                    {customerData.country && customerData.country !== "India" && (
                      <span className="shipping-note"> ( International- Including shipping amount)</span>
                    )}
                    {customerData.country === "India" && customerData.state === "Tamil Nadu" && customerData.city && (
                      <span className="shipping-note"> (Tamil Nadu)</span>
                    )}
                    {customerData.country === "India" && (customerData.state === "Kerala" || 
                      customerData.state === "Karnataka" || 
                      customerData.state === "Andhra Pradesh" || 
                      customerData.state === "Telangana" || 
                      customerData.state === "Puducherry" ||
                      customerData.state === "Lakshadweep") && customerData.city && (
                      <span className="shipping-note"> (South India)</span>
                    )}
                    {customerData.country === "India" && (customerData.state === "Delhi" || 
                      customerData.state === "Uttar Pradesh" || 
                      customerData.state === "Rajasthan" || 
                      customerData.state === "Punjab" || 
                      customerData.state === "Haryana" || 
                      customerData.state === "Himachal Pradesh" || 
                      customerData.state === "Uttarakhand" || 
                      customerData.state === "Jammu and Kashmir" || 
                      customerData.state === "Ladakh" ||
                      customerData.state === "Chandigarh") && customerData.city && (
                      <span className="shipping-note"> (North India)</span>
                    )}
                    {customerData.country === "India" && (customerData.state === "Maharashtra" || 
                      customerData.state === "Gujarat" || 
                      customerData.state === "Goa" || 
                      customerData.state === "Dadra and Nagar Haveli and Daman and Diu" || 
                      customerData.state === "Chhattisgarh" || 
                      customerData.state === "Madhya Pradesh" || 
                      customerData.state === "Andaman and Nicobar Islands" || 
                      customerData.state === "Bihar" || 
                      customerData.state === "Jharkhand" || 
                      customerData.state === "Odisha" || 
                      customerData.state === "West Bengal" || 
                      customerData.state === "Sikkim" || 
                      customerData.state === "Arunachal Pradesh" || 
                      customerData.state === "Assam" || 
                      customerData.state === "Manipur" || 
                      customerData.state === "Meghalaya" || 
                      customerData.state === "Mizoram" || 
                      customerData.state === "Nagaland" || 
                      customerData.state === "Tripura") && customerData.city && (
                      <span className="shipping-note"> (Other States)</span>
                    )}
                  </p>
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

              {/* Shipping Address Preview */}
              {customerData.name && customerData.address && customerData.city && customerData.country && (
                <div className="summary-address">
                  <h3>Shipping Address</h3>
                  <div className="address-preview">
                    <p><strong>{customerData.name}</strong></p>
                    <p>{customerData.address}</p>
                    <p>
                      {customerData.city}
                      {customerData.country === "India" && customerData.state && `, ${customerData.state}`}
                    </p>
                    <p>{customerData.country}</p>
                    {customerData.pincode && <p>PIN: {customerData.pincode}</p>}
                  </div>
                </div>
              )}

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
