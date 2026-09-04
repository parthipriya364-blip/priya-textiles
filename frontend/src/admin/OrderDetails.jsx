import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaPrint, FaSpinner } from "react-icons/fa";
import AdminPageHeader from "./components/AdminPageHeader";
import { getBooking, updateBookingStatus } from "../services/paymentService";
import "./OrderDetails.css";

const STATUS_OPTIONS = ["confirmed", "shipped", "out-for-delivery", "delivered", "cancelled"];

const statusLabel = (status) => status === "out-for-delivery"
  ? "Out for delivery"
  : status.charAt(0).toUpperCase() + status.slice(1);

const formatMoney = (value) => `₹${Number(value || 0).toLocaleString("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

const formatDate = (value) => new Date(value).toLocaleString("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getBooking(id)
      .then((response) => {
        if (active) setOrder(response.booking);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load order details.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  const changeStatus = async (event) => {
    const nextStatus = event.target.value;
    if (!order || nextStatus === order.orderStatus) return;
    try {
      setUpdating(true);
      await updateBookingStatus(order._id, { orderStatus: nextStatus });
      setOrder((current) => ({ ...current, orderStatus: nextStatus }));
    } catch (requestError) {
      setError(requestError.message || "Unable to update order status.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div>
        <AdminPageHeader title="Order details" subtitle="Loading order..." />
        <div className="order-details-loading"><FaSpinner className="spinner" /></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <AdminPageHeader title="Order details" subtitle="Order unavailable" />
        <div className="order-details-error">
          <p>{error || "This order could not be found."}</p>
          <button className="admin-btn admin-btn-outline" onClick={() => navigate("/admin/orders")}>
            <FaArrowLeft /> Back to orders
          </button>
        </div>
      </div>
    );
  }

  const orderNumber = order._id.slice(-8).toUpperCase();
  const address = [order.customer.address, order.customer.city, order.customer.state]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="order-details-page">
      <div className="order-details-back-row">
        <Link to="/admin/orders" className="admin-back-link"><FaArrowLeft /> Back to orders</Link>
        <button className="admin-btn admin-btn-outline" onClick={() => window.print()}>
          <FaPrint /> Print order
        </button>
      </div>

      <AdminPageHeader
        title={`Order #${orderNumber}`}
        subtitle={`Placed ${formatDate(order.createdAt)}`}
      />

      {error && <div className="order-details-alert">{error}</div>}

      <div className="order-details-grid">
        <section className="order-details-card order-details-status-card">
          <div>
            <span className="order-details-label">Order status</span>
            <strong>{statusLabel(order.orderStatus)}</strong>
          </div>
          <label>
            <span className="order-details-label">Update status</span>
            <select value={order.orderStatus} onChange={changeStatus} disabled={updating}>
              {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
            </select>
          </label>
          {updating && <FaSpinner className="spinner" aria-label="Updating status" />}
        </section>

        <section className="order-details-card">
          <h2>Customer information</h2>
          <dl className="order-details-list">
            <div><dt>Name</dt><dd>{order.customer.name}</dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${order.customer.email}`}>{order.customer.email}</a></dd></div>
            <div><dt>Phone</dt><dd><a href={`tel:${order.customer.phone}`}>{order.customer.phone}</a></dd></div>
          </dl>
        </section>

        <section className="order-details-card">
          <h2>Shipping address</h2>
          <address>
            {order.customer.name}<br />
            {address}<br />
            PIN: {order.customer.pincode}
          </address>
        </section>

        <section className="order-details-card order-details-items-card">
          <h2>Items ({order.items.length})</h2>
          <div className="order-items-table-wrap">
            <table className="order-items-table">
              <thead>
                <tr><th>Product</th><th>Size</th><th>Qty</th><th>Price</th><th>Total</th></tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={`${item.product || item.name}-${index}`}>
                    <td>
                      <div className="order-product-cell">
                        <img src={item.image} alt="" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td>{item.size || "Free Size"}</td>
                    <td>{item.quantity}</td>
                    <td>{formatMoney(item.price)}</td>
                    <td>{formatMoney(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="order-details-card order-details-summary-card">
          <h2>Payment and totals</h2>
          <div className="order-payment-meta">
            <span>Method</span><strong>{order.paymentMethod === "cod" ? "Cash on delivery" : order.paymentMethod.toUpperCase()}</strong>
            <span>Status</span><strong className={`payment-status payment-status-${order.paymentStatus}`}>{order.paymentStatus.toUpperCase()}</strong>
            {order.razorpayOrderId && <><span>Gateway order ID</span><strong>{order.razorpayOrderId}</strong></>}
            {order.razorpayPaymentId && <><span>Payment ID</span><strong>{order.razorpayPaymentId}</strong></>}
          </div>
          <div className="order-total-lines">
            <div><span>Subtotal</span><strong>{formatMoney(order.subtotal)}</strong></div>
            <div><span>Shipping</span><strong>{formatMoney(order.shipping)}</strong></div>
            <div className="order-grand-total"><span>Total</span><strong>{formatMoney(order.total)}</strong></div>
          </div>
        </section>

        <section className="order-details-card order-details-timeline-card">
          <h2>Order timeline</h2>
          <div className="order-timeline-item"><span><FaCheck /></span><div><strong>Order placed</strong><small>{formatDate(order.createdAt)}</small></div></div>
          <div className="order-timeline-item"><span><FaCheck /></span><div><strong>Current status: {statusLabel(order.orderStatus)}</strong><small>Last updated {formatDate(order.updatedAt || order.createdAt)}</small></div></div>
        </section>
      </div>
    </div>
  );
}
