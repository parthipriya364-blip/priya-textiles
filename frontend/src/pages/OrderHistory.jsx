import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyBookings } from "../services/paymentService";
import { useToast } from "../context/ToastContext";
import PageHeader from "../components/PageHeader";
import { 
  FaBox, 
  FaCheckCircle, 
  FaClock, 
  FaTimes, 
  FaEye,
  FaShoppingBag,
  FaTruck
} from "react-icons/fa";
import "./style/OrderHistory.css";

export default function OrderHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { showToast } = useToast();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await getMyBookings();
      setBookings(response.bookings || []);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      showToast(error.message || "Failed to load order history", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <FaCheckCircle className="status-icon confirmed" />;
      case "shipped":
        return <FaBox className="status-icon shipped" />;
      case "out-for-delivery":
        return <FaShoppingBag className="status-icon out-for-delivery" />;
      case "delivered":
        return <FaCheckCircle className="status-icon delivered" />;
      case "pending":
        return <FaClock className="status-icon pending" />;
      case "cancelled":
        return <FaTimes className="status-icon cancelled" />;
      default:
        return <FaBox className="status-icon" />;
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "paid";
      case "pending":
        return "pending";
      case "failed":
        return "failed";
      default:
        return "";
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    return booking.orderStatus === filter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="page-enter">
        <PageHeader
          eyebrow="Your Orders"
          title="Order History"
          crumbs={[{ label: "Order History" }]}
        />
        <section className="section">
          <div className="container">
            <div className="loading-state">Loading your orders...</div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Your Orders"
        title="Order History"
        crumbs={[{ label: "Order History" }]}
      />

      <section className="section">
        <div className="container">
          {bookings.length === 0 ? (
            <div className="empty-orders">
              <div className="empty-icon">
                <FaShoppingBag />
              </div>
              <h3>No Orders Yet</h3>
              <p>You haven't placed any orders. Start shopping to see your order history here.</p>
              <Link to="/" className="btn btn-primary">
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              {/* Filter Tabs */}
              <div className="order-filters">
                <button
                  className={`filter-btn ${filter === "all" ? "active" : ""}`}
                  onClick={() => setFilter("all")}
                >
                  All Orders ({bookings.length})
                </button>
                <button
                  className={`filter-btn ${filter === "confirmed" ? "active" : ""}`}
                  onClick={() => setFilter("confirmed")}
                >
                  Confirmed ({bookings.filter((b) => b.orderStatus === "confirmed").length})
                </button>
                <button
                  className={`filter-btn ${filter === "shipped" ? "active" : ""}`}
                  onClick={() => setFilter("shipped")}
                >
                  Shipped ({bookings.filter((b) => b.orderStatus === "shipped").length})
                </button>
                <button
                  className={`filter-btn ${filter === "out-for-delivery" ? "active" : ""}`}
                  onClick={() => setFilter("out-for-delivery")}
                >
                  Out for Delivery ({bookings.filter((b) => b.orderStatus === "out-for-delivery").length})
                </button>
                <button
                  className={`filter-btn ${filter === "delivered" ? "active" : ""}`}
                  onClick={() => setFilter("delivered")}
                >
                  Delivered ({bookings.filter((b) => b.orderStatus === "delivered").length})
                </button>
                <button
                  className={`filter-btn ${filter === "cancelled" ? "active" : ""}`}
                  onClick={() => setFilter("cancelled")}
                >
                  Cancelled ({bookings.filter((b) => b.orderStatus === "cancelled").length})
                </button>
              </div>

              {/* Orders List */}
              <div className="orders-list">
                {filteredBookings.length === 0 ? (
                  <div className="no-results">
                    <p>No {filter === "out-for-delivery" ? "out for delivery" : filter} orders found.</p>
                  </div>
                ) : (
                  filteredBookings.map((booking) => (
                    <div key={booking._id} className="order-card">
                      <div className="order-header">
                        <div className="order-info">
                          <div className="order-id">
                            Order ID: <span>#{booking._id.slice(-8).toUpperCase()}</span>
                          </div>
                          <div className="order-date">
                            Placed on {formatDate(booking.createdAt)}
                          </div>
                        </div>
                        <div className="order-status-badges">
                          <div className={`status-badge ${booking.orderStatus}`}>
                            {getStatusIcon(booking.orderStatus)}
                            <span>{booking.orderStatus === "out-for-delivery" ? "OUT FOR DELIVERY" : booking.orderStatus.toUpperCase()}</span>
                          </div>
                          <div className={`payment-badge ${getPaymentStatusClass(booking.paymentStatus)}`}>
                            {booking.paymentStatus === "paid" ? "PAID" : 
                             booking.paymentStatus === "pending" ? "COD" : "FAILED"}
                          </div>
                        </div>
                      </div>

                      <div className="order-body">
                        <div className="order-items">
                          {booking.items.map((item, index) => (
                            <div key={index} className="order-item">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                onError={(e) => {
                                  e.target.src = '/placeholder-product.jpg';
                                }}
                              />
                              <div className="item-info">
                                <h4>{item.name}</h4>
                                <p>Size: {item.size}</p>
                                <p>Qty: {item.quantity}</p>
                              </div>
                              <div className="item-price">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="order-summary">
                          <div className="summary-row">
                            <span>Subtotal:</span>
                            <span>₹{booking.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="summary-row">
                            <span>Shipping:</span>
                            <span>
                              {booking.shipping === 0 ? "FREE" : `₹${booking.shipping.toFixed(2)}`}
                            </span>
                          </div>
                          <div className="summary-row total">
                            <span>Total:</span>
                            <span>₹{booking.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="order-footer">
                        <div className="delivery-info">
                          <p><strong>Delivery Address:</strong></p>
                          <p>{booking.customer.name}</p>
                          <p>{booking.customer.address}, {booking.customer.city}</p>
                          <p>{booking.customer.state} - {booking.customer.pincode}</p>
                          <p>Phone: {booking.customer.phone}</p>
                        </div>
                        <div className="order-actions">
                          <Link 
                            to={`/order-details/${booking._id}`} 
                            className="btn btn-outline-dark"
                          >
                            <FaEye /> View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
