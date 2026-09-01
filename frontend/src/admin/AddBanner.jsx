import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminPageHeader from "./components/AdminPageHeader";
import BannerForm from "./components/BannerForm";
import { useBanners } from "../context/BannerContext";
import { useToast } from "../context/ToastContext";
import "./admin-forms.css";

export default function AddBanner() {
  const navigate = useNavigate();
  const { addBanner } = useBanners();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    const result = await addBanner(formData);
    setSubmitting(false);

    if (result.ok) {
      navigate("/admin/banners");
    } else {
      showToast(result.error || 'Failed to add banner', 'error');
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Add Banner"
        subtitle="Add a new banner to the homepage slider"
      />
      <div className="admin-form-card">
        <BannerForm 
          onSubmit={handleSubmit} 
          submitLabel={submitting ? "Adding..." : "Add Banner"}
          submitting={submitting}
        />
      </div>
    </div>
  );
}
