import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBooking } from "../services/paymentService";
import { FaCheckCircle, FaBox, FaTruck, FaHome } from "react-icons/fa";
import "./style/OrderSuccess.css";

export default function OrderSuccess() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const response = await getBooking(bookingId);
      setBooking(response.booking);
    } catch (error) {
      console.error("Failed to load booking:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="order-success-page">
        <div className="container">
          <div className="loading-state">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="order-success-page">
        <div className="container">
          <div className="error-state">
            <h2>Order Not Found</h2>
            <Link to="/" className="btn btn-primary">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-page">
      <div className="container">
        <div className="success-content">
          <div className="success-icon">
            <FaCheckCircle />
          </div>

          <h1>Order Placed Successfully!</h1>
          <p className="success-message">
            Thank you for your purchase. Your order has been confirmed and will be processed soon.
          </p>

          <div className="order-info-card">
            <h2>Order Details</h2>
            
            <div className="info-row">
              <span className="label">Order ID:</span>
              <span className="value">{booking._id}</span>
            </div>

            <div className="info-row">
              <span className="label">Payment Method:</span>
              <span className="value payment-method">
                {booking.paymentMethod === "cod" ? "Cash on Delivery" : 
                 booking.paymentMethod === "upi" ? "UPI" : "Card"}
              </span>
            </div>

            <div className="info-row">
              <span className="label">Payment Status:</span>
              <span className={`value status ${booking.paymentStatus}`}>
                {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
              </span>
            </div>

            <div className="info-row">
              <span className="label">Total Amount:</span>
              <span className="value amount">₹{booking.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="delivery-info-card">
            <h3>Delivery Address</h3>
            <div className="address-details">
              <p><strong>{booking.customer.name}</strong></p>
              <p>{booking.customer.address}</p>
              <p>{booking.customer.city}, {booking.customer.state} - {booking.customer.pincode}</p>
              <p>Phone: {booking.customer.phone}</p>
              <p>Email: {booking.customer.email}</p>
            </div>
          </div>

          <div className="ordered-items-card">
            <h3>Ordered Items</h3>
            <div className="items-list">
              {booking.items.map((item, index) => (
                <div key={index} className="order-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>Size: {item.size}</p>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Subtotal</span>
                <span>₹{booking.subtotal.toFixed(2)}</span>
              </div>
              <div className="price-row">
                <span>Shipping</span>
                <span>{booking.shipping === 0 ? "FREE" : `₹${booking.shipping.toFixed(2)}`}</span>
              </div>
              <div className="price-row total">
                <span>Total</span>
                <span>₹{booking.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <Link to="/" className="btn btn-outline-dark">
              <FaHome /> Continue Shopping
            </Link>
            <Link to="/orders" className="btn btn-primary">
              <FaBox /> View My Orders
            </Link>
          </div>

          <div className="next-steps">
            <h3>What's Next?</h3>
            <div className="steps-grid">
              <div className="step-item">
                <div className="step-icon">
                  <FaCheckCircle />
                </div>
                <h4>Order Confirmed</h4>
                <p>Your order has been placed successfully</p>
              </div>
              <div className="step-item">
                <div className="step-icon">
                  <FaBox />
                </div>
                <h4>Processing</h4>
                <p>We're preparing your items for shipment</p>
              </div>
              <div className="step-item">
                <div className="step-icon">
                  <FaTruck />
                </div>
                <h4>On the Way</h4>
                <p>Your order will be delivered soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
