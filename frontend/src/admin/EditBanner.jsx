import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminPageHeader from "./components/AdminPageHeader";
import BannerForm from "./components/BannerForm";
import { useBanners } from "../context/BannerContext";
import { useToast } from "../context/ToastContext";
import Loader from "../components/Loader";
import "./admin-forms.css";

export default function EditBanner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { banners, updateBanner, loading: bannersLoading } = useBanners();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    const foundBanner = banners.find((b) => b._id === id);
    if (foundBanner) {
      setBanner(foundBanner);
    }
  }, [id, banners]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    const result = await updateBanner(id, formData);
    setSubmitting(false);

    if (result.ok) {
      navigate("/admin/banners");
    } else {
      showToast(result.error || 'Failed to update banner', 'error');
    }
  };

  if (bannersLoading) {
    return <Loader label="Loading banner" />;
  }

  if (!banner) {
    return (
      <div>
        <AdminPageHeader title="Banner Not Found" />
        <div className="admin-form-card">
          <p>The banner you're looking for doesn't exist.</p>
          <button
            className="admin-btn admin-btn-gold"
            onClick={() => navigate("/admin/banners")}
          >
            Back to Banners
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Edit Banner"
        subtitle="Update banner details and image"
      />
      <div className="admin-form-card">
        <BannerForm 
          initialData={banner}
          onSubmit={handleSubmit} 
          submitLabel={submitting ? "Saving..." : "Save Changes"}
          submitting={submitting}
        />
      </div>
    </div>
  );
}
