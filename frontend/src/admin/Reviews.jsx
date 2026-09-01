import { useState, useEffect } from "react";
import { FaStar, FaTrash, FaSpinner } from "react-icons/fa";
import AdminPageHeader from "./components/AdminPageHeader";
import Modal from "./components/Modal";
import { getAllReviews, deleteReview } from "../services/reviewService";
import "./admin-forms.css";
import "./Reviews.css";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await getAllReviews();
      setReviews(response.reviews || []);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await deleteReview(deleteTarget._id);
      setReviews((prev) => prev.filter((r) => r._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete review:", error);
      alert("Failed to delete review");
    } finally {
      setDeleting(false);
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
        <AdminPageHeader title="Reviews" subtitle="Loading reviews..." />
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <FaSpinner className="spinner" style={{ fontSize: "32px", color: "#8B0000" }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader title="Reviews" subtitle={`${reviews.length} customer reviews`} />

      <div className="review-list">
        {reviews.map((r) => (
          <div className="review-admin-card" key={r._id}>
            <div className="review-admin-head">
              <div>
                <strong>{r.customerName}</strong>
                <span className="verified-badge">Verified Purchase</span>
                <span className="review-date">{formatDate(r.createdAt)}</span>
              </div>
              <button
                className="row-action-btn danger"
                onClick={() => setDeleteTarget(r)}
                aria-label="Delete review"
              >
                <FaTrash />
              </button>
            </div>
            <div className="review-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar key={i} className={i < r.rating ? "filled" : ""} />
              ))}
            </div>
            <p className="review-product">{r.product?.name || "Unknown Product"}</p>
            <p className="review-message">{r.comment}</p>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="table-empty">No reviews yet.</div>
        )}
      </div>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Review"
        size="sm"
        footer={
          <>
            <button 
              className="admin-btn admin-btn-outline" 
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </button>
            <button 
              className="admin-btn admin-btn-maroon" 
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </>
        }
      >
        <p>Delete this review by <b>{deleteTarget?.customerName}</b>?</p>
      </Modal>
    </div>
  );
}
