import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBooking, cancelBooking } from "../services/paymentService";
import { canReviewBooking, createReview } from "../services/reviewService";
import { useToast } from "../context/ToastContext";
import { useSocket } from "../context/SocketContext";
import PageHeader from "../components/PageHeader";
import { 
  FaCheckCircle, 
  FaBox, 
  FaTruck, 
  FaHome,
  FaArrowLeft,
  FaTimes,
  FaStar
} from "react-icons/fa";
import "./style/OrderDetails.css";

export default function OrderDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { socket, connected, joinOrderRoom, leaveOrderRoom } = useSocket();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewableProducts, setReviewableProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBooking();

    // Join order room for real-time updates
    if (socket && bookingId) {
      joinOrderRoom(bookingId);
    }

    // Listen for real-time order updates
    if (socket) {
      socket.on('order-status-updated', (data) => {
        if (data.orderId === bookingId) {
          console.log('📦 Real-time order update received:', data);
          showToast(data.message || 'Order status updated!', 'info');
          
          // Update local booking state
          setBooking((prevBooking) => ({
            ...prevBooking,
            orderStatus: data.orderStatus,
            paymentStatus: data.paymentStatus,
          }));
        }
      });
    }

    // Cleanup: leave room on unmount
    return () => {
      if (socket && bookingId) {
        leaveOrderRoom(bookingId);
        socket.off('order-status-updated');
      }
    };
  }, [bookingId, socket]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const response = await getBooking(bookingId);
      setBooking(response.booking);
      
      // Check if user can review this order
      if (response.booking.orderStatus === "delivered") {
        try {
          const reviewStatus = await canReviewBooking(bookingId);
          if (reviewStatus.canReview && reviewStatus.products.length > 0) {
            setReviewableProducts(reviewStatus.products);
          }
        } catch (error) {
          console.error("Failed to check review status:", error);
        }
      }
    } catch (error) {
      console.error("Failed to load booking:", error);
      showToast(error.message || "Failed to load order details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      setCancelling(true);
      await cancelBooking(bookingId);
      showToast("Order cancelled successfully", "success");
      await loadBooking();
    } catch (error) {
      showToast(error.message || "Failed to cancel order", "error");
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOpenReviewModal = (product) => {
    setSelectedProduct(product);
    setRating(0);
    setHoverRating(0);
    setComment("");
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedProduct(null);
    setRating(0);
    setHoverRating(0);
    setComment("");
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      showToast("Please select a rating", "error");
      return;
    }

    if (!comment.trim()) {
      showToast("Please write a review", "error");
      return;
    }

    try {
      setSubmitting(true);
      await createReview({
        bookingId: bookingId,
        productId: selectedProduct.productId,
        rating,
        comment: comment.trim(),
      });

      showToast("Review submitted successfully!", "success");
      
      // Remove reviewed product from reviewable list
      setReviewableProducts(prev => 
        prev.filter(p => p.productId !== selectedProduct.productId)
      );
      
      handleCloseReviewModal();
    } catch (error) {
      showToast(error.message || "Failed to submit review", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-enter">
        <PageHeader
          eyebrow="Order Details"
          title="Loading..."
          crumbs={[
            { label: "Order History", path: "/orders" },
            { label: "Order Details" }
          ]}
        />
        <section className="section">
          <div className="container">
            <div className="loading-state">Loading order details...</div>
          </div>
        </section>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="page-enter">
        <PageHeader
          eyebrow="Order Details"
          title="Order Not Found"
          crumbs={[
            { label: "Order History", path: "/orders" },
            { label: "Order Details" }
          ]}
        />
        <section className="section">
          <div className="container">
            <div className="error-state">
              <h2>Order Not Found</h2>
              <p>The order you're looking for doesn't exist or you don't have permission to view it.</p>
              <Link to="/orders" className="btn btn-primary">
                <FaArrowLeft /> Back to Orders
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const canCancel = booking.orderStatus === "confirmed";

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Order Details"
        title={`Order #${booking._id.slice(-8).toUpperCase()}`}
        crumbs={[
          { label: "Order History", path: "/orders" },
          { label: "Order Details" }
        ]}
      />

      <section className="section">
        <div className="container">
          <div className="order-details-content">
            {/* Back Button */}
            <Link to="/orders" className="back-link">
              <FaArrowLeft /> Back to Orders
            </Link>

            {/* Order Status Card */}
            <div className="status-card">
              <h2>Order Status</h2>
              <div className="status-timeline">
                <div className={`timeline-step ${booking.orderStatus !== "cancelled" ? "completed" : ""}`}>
                  <div className="step-icon">
                    <FaCheckCircle />
                  </div>
                  <div className="step-content">
                    <h4>Order Placed</h4>
                    <p>{formatDate(booking.createdAt)}</p>
                  </div>
                </div>

                <div className={`timeline-step ${booking.orderStatus === "confirmed" || booking.orderStatus === "shipped" || booking.orderStatus === "out-for-delivery" || booking.orderStatus === "delivered" ? "completed" : ""}`}>
                  <div className="step-icon">
                    <FaBox />
                  </div>
                  <div className="step-content">
                    <h4>Confirmed</h4>
                    <p>{booking.orderStatus === "confirmed" || booking.orderStatus === "shipped" || booking.orderStatus === "out-for-delivery" || booking.orderStatus === "delivered" ? "Processing your order" : "Waiting for confirmation"}</p>
                  </div>
                </div>

                <div className={`timeline-step ${booking.orderStatus === "shipped" || booking.orderStatus === "out-for-delivery" || booking.orderStatus === "delivered" ? "completed" : ""}`}>
                  <div className="step-icon">
                    <FaTruck />
                  </div>
                  <div className="step-content">
                    <h4>Shipped</h4>
                    <p>{booking.orderStatus === "shipped" || booking.orderStatus === "out-for-delivery" || booking.orderStatus === "delivered" ? "On the way" : "Not yet shipped"}</p>
                  </div>
                </div>

                <div className={`timeline-step ${booking.orderStatus === "out-for-delivery" || booking.orderStatus === "delivered" ? "completed" : ""} ${booking.orderStatus === "out-for-delivery" ? "active" : ""}`}>
                  <div className="step-icon">
                    <FaTruck />
                  </div>
                  <div className="step-content">
                    <h4>Out for Delivery</h4>
                    <p>{booking.orderStatus === "out-for-delivery" ? "Your order is out for delivery" : booking.orderStatus === "delivered" ? "Was out for delivery" : "Not yet out for delivery"}</p>
                  </div>
                </div>

                <div className={`timeline-step ${booking.orderStatus === "delivered" ? "completed" : ""}`}>
                  <div className="step-icon">
                    <FaHome />
                  </div>
                  <div className="step-content">
                    <h4>Delivered</h4>
                    <p>{booking.orderStatus === "delivered" ? "Order delivered" : "Not yet delivered"}</p>
                  </div>
                </div>
              </div>

              {booking.orderStatus === "cancelled" && (
                <div className="cancelled-notice">
                  <FaTimes />
                  <span>This order has been cancelled</span>
                </div>
              )}
            </div>

            {/* Order Information */}
            <div className="info-grid">
              <div className="info-card">
                <h3>Order Information</h3>
                <div className="info-row">
                  <span>Order ID:</span>
                  <span className="value">#{booking._id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="info-row">
                  <span>Order Date:</span>
                  <span className="value">{formatDate(booking.createdAt)}</span>
                </div>
                <div className="info-row">
                  <span>Payment Method:</span>
                  <span className="value payment-method">
                    {booking.paymentMethod === "cod" ? "Cash on Delivery" :
                     booking.paymentMethod === "upi" ? "UPI" : "Card"}
                  </span>
                </div>
                <div className="info-row">
                  <span>Payment Status:</span>
                  <span className={`value status ${booking.paymentStatus}`}>
                    {booking.paymentStatus.toUpperCase()}
                  </span>
                </div>
                {booking.razorpayPaymentId && (
                  <div className="info-row">
                    <span>Payment ID:</span>
                    <span className="value payment-id">{booking.razorpayPaymentId}</span>
                  </div>
                )}
              </div>

              <div className="info-card">
                <h3>Delivery Address</h3>
                <div className="address-content">
                  <p><strong>{booking.customer.name}</strong></p>
                  <p>{booking.customer.address}</p>
                  <p>{booking.customer.city}, {booking.customer.state}</p>
                  <p>PIN: {booking.customer.pincode}</p>
                  <p>Phone: {booking.customer.phone}</p>
                  <p>Email: {booking.customer.email}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="items-card">
              <h3>Order Items</h3>
              <div className="items-list">
                {booking.items.map((item, index) => (
                  <div key={index} className="detail-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p>Size: {item.size}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ₹{item.price.toFixed(2)}</p>
                    </div>
                    <div className="item-total">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="price-summary">
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

            {/* Actions */}
            {canCancel && (
              <div className="order-actions">
                <button
                  onClick={handleCancelOrder}
                  className="btn btn-danger"
                  disabled={cancelling}
                >
                  <FaTimes />
                  {cancelling ? "Cancelling..." : "Cancel Order"}
                </button>
              </div>
            )}

            {/* Review Button for Delivered Orders */}
            {booking.orderStatus === "delivered" && reviewableProducts.length > 0 && (
              <div className="order-actions">
                <h3 style={{ marginBottom: "15px" }}>Leave a Review</h3>
                <div className="reviewable-products">
                  {reviewableProducts.map((product) => (
                    <div key={product.productId} className="reviewable-product-card">
                      <img src={product.image} alt={product.name} />
                      <div className="product-info">
                        <h4>{product.name}</h4>
                        <button
                          onClick={() => handleOpenReviewModal(product)}
                          className="btn btn-primary btn-sm"
                        >
                          <FaStar /> Write Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Review Modal */}
      {showReviewModal && selectedProduct && (
        <div className="review-modal-overlay" onClick={handleCloseReviewModal}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseReviewModal}>
              <FaTimes />
            </button>
            
            <div className="modal-header">
              <h2>Write a Review</h2>
              <div className="review-product-info">
                <img src={selectedProduct.image} alt={selectedProduct.name} />
                <h3>{selectedProduct.name}</h3>
              </div>
            </div>

            <form onSubmit={handleSubmitReview} className="review-form">
              <div className="form-group">
                <label>Rating *</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${star <= (hoverRating || rating) ? "active" : ""}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <FaStar />
                    </button>
                  ))}
                </div>
                <p className="rating-text">
                  {rating === 0 ? "Click to rate" : 
                   rating === 1 ? "Poor" :
                   rating === 2 ? "Fair" :
                   rating === 3 ? "Good" :
                   rating === 4 ? "Very Good" : "Excellent"}
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="comment">Your Review *</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows="6"
                  maxLength="1000"
                  required
                />
                <p className="char-count">{comment.length}/1000 characters</p>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseReviewModal}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || rating === 0 || !comment.trim()}
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
