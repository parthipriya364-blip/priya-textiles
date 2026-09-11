import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEye,
  FaSyncAlt,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaToggleOn,
  FaToggleOff,
  FaEdit,
} from "react-icons/fa";
import AdminPageHeader from "./components/AdminPageHeader";
import Modal from "./components/Modal";
import { useBanners, MAX_BANNERS } from "../context/BannerContext";
import "./admin-forms.css";
import "./BannerManager.css";

export default function BannerManager() {
  const navigate = useNavigate();
  const {
    banners,
    loading,
    replaceBanner,
    deleteBanner,
    toggleEnabled,
    reorderBanner,
  } = useBanners();

  const [previewBanner, setPreviewBanner] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const replaceInputRef = useRef(null);
  const replaceTargetId = useRef(null);

  const sorted = [...banners].sort((a, b) => a.order - b.order);

  const handleReplaceClick = (id) => {
    replaceTargetId.current = id;
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = async (e) => {
    const file = e.target.files?.[0];
    if (file && replaceTargetId.current != null) {
      await replaceBanner(replaceTargetId.current, file);
    }
    e.target.value = "";
    replaceTargetId.current = null;
  };

  const confirmDelete = async () => {
    await deleteBanner(deleteTarget._id);
    setDeleteTarget(null);
  };

  const handleToggle = async (id) => {
    await toggleEnabled(id);
  };

  const handleReorder = async (id, direction) => {
    await reorderBanner(id, direction);
  };

  return (
    <div>
      <AdminPageHeader
        title="Banner Manager"
        subtitle={`${banners.length} / ${MAX_BANNERS} banners — changes reflect instantly on the homepage slider`}
        action={
          <button
            className="admin-btn admin-btn-gold"
            onClick={() => navigate("/admin/banners/add")}
            disabled={banners.length >= MAX_BANNERS || loading}
          >
            <FaPlus /> Add Banner
          </button>
        }
      />

      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleReplaceFile}
      />

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading banners...</div>
      ) : (
        <div className="banner-manager-list">
          {sorted.map((banner, i) => (
            <div className={`banner-manager-row ${banner.enabled ? "" : "disabled"}`} key={banner._id}>
              <div className="banner-thumb">
                <img src={banner.image?.url || banner.image} alt={banner.title || "Banner"} />
              </div>

              <div className="banner-row-actions">
                <button className="admin-btn admin-btn-outline" onClick={() => setPreviewBanner(banner)}>
                  <FaEye /> Preview
                </button>
                <button 
                  className="admin-btn admin-btn-outline" 
                  onClick={() => navigate(`/admin/banners/edit/${banner._id}`)}
                >
                  <FaEdit /> Edit
                </button>
                <button className="admin-btn admin-btn-outline" onClick={() => handleReplaceClick(banner._id)}>
                  <FaSyncAlt /> Replace Image
                </button>
                <button
                  className="row-action-btn"
                  onClick={() => handleReorder(banner._id, "up")}
                  disabled={i === 0}
                  aria-label="Move up"
                  title="Move up"
                >
                  <FaArrowUp />
                </button>
                <button
                  className="row-action-btn"
                  onClick={() => handleReorder(banner._id, "down")}
                  disabled={i === sorted.length - 1}
                  aria-label="Move down"
                  title="Move down"
                >
                  <FaArrowDown />
                </button>
                <button
                  className="row-action-btn"
                  onClick={() => handleToggle(banner._id)}
                  aria-label={banner.enabled ? "Disable banner" : "Enable banner"}
                  title={banner.enabled ? "Disable" : "Enable"}
                >
                  {banner.enabled ? <FaToggleOn color="var(--c-gold-deep)" size={18} /> : <FaToggleOff size={18} />}
                </button>
                <button
                  className="row-action-btn danger"
                  onClick={() => setDeleteTarget(banner)}
                  aria-label="Delete banner"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}

          {sorted.length === 0 && (
            <div className="table-empty">No banners yet — add one to get started.</div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        open={!!previewBanner}
        onClose={() => setPreviewBanner(null)}
        title="Banner Preview"
        size="lg"
      >
        {previewBanner && (
          <div className="banner-preview-modal">
            <img src={previewBanner.image?.url || previewBanner.image} alt="Banner" />
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Banner"
        size="sm"
        footer={
          <>
            <button className="admin-btn admin-btn-outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </button>
            <button className="admin-btn admin-btn-maroon" onClick={confirmDelete}>
              Delete
            </button>
          </>
        }
      >
        <p>Delete this banner? It will disappear from the homepage slider immediately.</p>
      </Modal>
    </div>
  );
}
