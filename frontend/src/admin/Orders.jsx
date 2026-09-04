import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaPrint, FaEdit, FaSpinner } from "react-icons/fa";
import AdminPageHeader from "./components/AdminPageHeader";
import SearchBar from "./components/SearchBar";
import DataTable from "./components/DataTable";
import Modal from "./components/Modal";
import { getAllBookings, updateBookingStatus } from "../services/paymentService";
import "./admin-forms.css";

const STATUS_OPTIONS = ["confirmed", "shipped", "out-for-delivery", "delivered", "cancelled"];

const statusBadge = (status) => {
  const map = {
    confirmed: "badge-gold",
    shipped: "badge-blue",
    "out-for-delivery": "badge-purple",
    delivered: "badge-green",
    cancelled: "badge-maroon",
  };
  const displayText = status === "out-for-delivery" ? "OUT FOR DELIVERY" : status.toUpperCase();
  return <span className={`badge ${map[status] || "badge-gray"}`}>{displayText}</span>;
};

const paymentBadge = (status) => {
  const map = { 
    paid: "badge-green", 
    pending: "badge-gold", 
    failed: "badge-maroon" 
  };
  return <span className={`badge ${map[status] || "badge-gray"}`}>{status.toUpperCase()}</span>;
};

export default function Orders() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewOrder, setViewOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await getAllBookings();
      setBookings(response.bookings || []);
    } catch (error) {
      console.error("Failed to load bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return bookings.filter((booking) => {
      if (statusFilter !== "all" && booking.orderStatus !== statusFilter) return false;
      if (query) {
        const searchLower = query.toLowerCase();
        const orderId = booking._id.slice(-8).toLowerCase();
        const customerName = booking.customer.name.toLowerCase();
        const customerEmail = booking.customer.email.toLowerCase();
        
        if (!orderId.includes(searchLower) && 
            !customerName.includes(searchLower) && 
            !customerEmail.includes(searchLower)) {
          return false;
        }
      }
      return true;
    });
  }, [bookings, query, statusFilter]);

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await updateBookingStatus(editOrder._id, { orderStatus: newStatus });
      
      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b._id === editOrder._id ? { ...b, orderStatus: newStatus } : b))
      );
      setEditOrder(null);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div>
        <AdminPageHeader title="Orders" subtitle="Loading orders..." />
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <FaSpinner className="spinner" style={{ fontSize: "32px", color: "#8B0000" }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader title="Orders" subtitle={`${bookings.length} total orders`} />

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <SearchBar 
            value={query} 
            onChange={setQuery} 
            placeholder="Search order ID, customer name or email..." 
          />
          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="out-for-delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <DataTable
        emptyText="No orders found."
        columns={[
          { 
            key: "id", 
            label: "Order ID",
            render: (b) => (
              <Link className="admin-order-link" to={`/admin/orders/${b._id}`}>
                #{b._id.slice(-8).toUpperCase()}
              </Link>
            )
          },
          { 
            key: "customer", 
            label: "Customer",
            render: (b) => (
              <div>
                <div style={{ fontWeight: 500 }}>{b.customer.name}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>{b.customer.email}</div>
              </div>
            )
          },
          { 
            key: "items", 
            label: "Items",
            render: (b) => (
              <div>
                <div>{b.items.length} item{b.items.length > 1 ? 's' : ''}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {b.items[0]?.name || 'N/A'}
                  {b.items.length > 1 && ` +${b.items.length - 1} more`}
                </div>
              </div>
            )
          },
          { 
            key: "amount", 
            label: "Amount", 
            render: (b) => `₹${b.total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
          },
          { 
            key: "paymentMethod", 
            label: "Payment",
            render: (b) => (
              <div>
                <div>{b.paymentMethod === 'cod' ? 'COD' : b.paymentMethod.toUpperCase()}</div>
                <div>{paymentBadge(b.paymentStatus)}</div>
              </div>
            )
          },
          { 
            key: "orderStatus", 
            label: "Status", 
            render: (b) => statusBadge(b.orderStatus) 
          },
          { 
            key: "date", 
            label: "Date",
            render: (b) => formatDate(b.createdAt)
          },
          {
            key: "actions",
            label: "Actions",
            render: (b) => (
              <div className="row-actions">
                <button 
                  className="row-action-btn" 
                  onClick={() => navigate(`/admin/orders/${b._id}`)} 
                  aria-label="View"
                  title="View Details"
                >
                  <FaEye />
                </button>
                <button 
                  className="row-action-btn" 
                  onClick={() => setEditOrder(b)} 
                  aria-label="Edit status"
                  title="Update Status"
                >
                  <FaEdit />
                </button>
                <button 
                  className="row-action-btn" 
                  onClick={() => setInvoiceOrder(b)} 
                  aria-label="Print invoice"
                  title="Print Invoice"
                >
                  <FaPrint />
                </button>
              </div>
            ),
          },
        ]}
        rows={filtered}
      />

      {/* View Order Modal */}
      <Modal 
        open={!!viewOrder} 
        onClose={() => setViewOrder(null)} 
        title={`Order #${viewOrder?._id.slice(-8).toUpperCase()}`} 
        size="md"
      >
        {viewOrder && (
          <div className="order-detail">
            <h4>Customer Information</h4>
            <p><b>Name:</b> {viewOrder.customer.name}</p>
            <p><b>Email:</b> {viewOrder.customer.email}</p>
            <p><b>Phone:</b> {viewOrder.customer.phone}</p>
            
            <h4 style={{ marginTop: "20px" }}>Shipping Address</h4>
            <p>{viewOrder.customer.address}</p>
            <p>{viewOrder.customer.city}, {viewOrder.customer.state}</p>
            <p>PIN: {viewOrder.customer.pincode}</p>
            
            <h4 style={{ marginTop: "20px" }}>Order Items</h4>
            {viewOrder.items.map((item, index) => (
              <div key={index} style={{ 
                display: "flex",
                gap: "12px",
                padding: "12px", 
                background: "#f9fafb", 
                borderRadius: "8px",
                marginBottom: "8px",
                alignItems: "center"
              }}>
                <img 
                  src={item.image} 
                  alt={item.name}
                  style={{
                    width: "70px",
                    height: "70px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 6px 0" }}><b>{item.name}</b></p>
                  <p style={{ margin: "0 0 6px 0", color: "#666", fontSize: "14px" }}>
                    Size: {item.size} | Qty: {item.quantity} | Price: ₹{item.price}
                  </p>
                  <p style={{ margin: 0 }}><b>Subtotal: ₹{(item.price * item.quantity).toFixed(2)}</b></p>
                </div>
              </div>
            ))}
            
            <h4 style={{ marginTop: "20px" }}>Payment Details</h4>
            <p><b>Subtotal:</b> ₹{viewOrder.subtotal.toFixed(2)}</p>
            <p><b>Shipping:</b> ₹{viewOrder.shipping.toFixed(2)}</p>
            <p><b>Total:</b> ₹{viewOrder.total.toFixed(2)}</p>
            <p><b>Payment Method:</b> {viewOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : viewOrder.paymentMethod.toUpperCase()}</p>
            <p><b>Payment Status:</b> {viewOrder.paymentStatus.toUpperCase()}</p>
            {viewOrder.razorpayPaymentId && (
              <p><b>Payment ID:</b> {viewOrder.razorpayPaymentId}</p>
            )}
            
            <h4 style={{ marginTop: "20px" }}>Order Status</h4>
            <p><b>Status:</b> {viewOrder.orderStatus.toUpperCase()}</p>
            <p><b>Date:</b> {formatDate(viewOrder.createdAt)}</p>
          </div>
        )}
      </Modal>

      {/* Edit Status Modal */}
      <Modal
        open={!!editOrder}
        onClose={() => setEditOrder(null)}
        title={`Update Status — #${editOrder?._id.slice(-8).toUpperCase()}`}
        size="sm"
      >
        <div className="status-options">
          <p style={{ marginBottom: "16px", color: "#666" }}>
            Current Status: <b>{editOrder?.orderStatus === "out-for-delivery" ? "OUT FOR DELIVERY" : editOrder?.orderStatus.toUpperCase()}</b>
          </p>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              className={`admin-btn ${editOrder?.orderStatus === s ? "admin-btn-gold" : "admin-btn-outline"}`}
              onClick={() => updateStatus(s)}
              disabled={updating}
            >
              {updating ? "Updating..." : (s === "out-for-delivery" ? "OUT FOR DELIVERY" : s.toUpperCase())}
            </button>
          ))}
        </div>
      </Modal>

      {/* Invoice Modal */}
      <Modal
        open={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
        title="Invoice"
        size="md"
        footer={
          <button className="admin-btn admin-btn-gold" onClick={() => window.print()}>
            <FaPrint /> Print
          </button>
        }
      >
        {invoiceOrder && (
          <div className="invoice-preview">
            <h3>Priya Textiles</h3>
            <p className="invoice-meta">
              Order #{invoiceOrder._id.slice(-8).toUpperCase()} · {formatDate(invoiceOrder.createdAt)}
            </p>
            
            <h4>Bill To:</h4>
            <p>{invoiceOrder.customer.name}</p>
            <p>{invoiceOrder.customer.email}</p>
            <p>{invoiceOrder.customer.phone}</p>
            <p>{invoiceOrder.customer.address}</p>
            <p>{invoiceOrder.customer.city}, {invoiceOrder.customer.state} - {invoiceOrder.customer.pincode}</p>
            
            <h4 style={{ marginTop: "20px" }}>Items:</h4>
            {invoiceOrder.items.map((item, index) => (
              <div className="invoice-row" key={index} style={{ alignItems: "center", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                  <img 
                    src={item.image} 
                    alt={item.name}
                    style={{
                      width: "40px",
                      height: "40px",
                      objectFit: "cover",
                      borderRadius: "4px",
                      border: "1px solid #e5e7eb"
                    }}
                    className="no-print"
                  />
                  <span>{item.name} (x{item.quantity})</span>
                </div>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            
            <div className="invoice-row"><span>Subtotal</span><span>₹{invoiceOrder.subtotal.toFixed(2)}</span></div>
            <div className="invoice-row"><span>Shipping</span><span>₹{invoiceOrder.shipping.toFixed(2)}</span></div>
            <div className="invoice-row total">
              <span>Total Amount</span>
              <span>₹{invoiceOrder.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
            
            <p style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
              Payment Method: {invoiceOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : invoiceOrder.paymentMethod.toUpperCase()}
            </p>
            <p style={{ fontSize: "12px", color: "#666" }}>
              Payment Status: {invoiceOrder.paymentStatus.toUpperCase()}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
