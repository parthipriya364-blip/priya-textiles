import { useState, useEffect } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useToast } from "../../context/ToastContext";

export default function BannerForm({ initialData, onSubmit, submitLabel = "Save", submitting = false }) {
  const { showToast } = useToast();
  
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    link: '',
  });

  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        subtitle: initialData.subtitle || '',
        link: initialData.link || '',
      });
      if (initialData.image?.url) {
        setMainImagePreview(initialData.image.url);
      } else if (initialData.image) {
        setMainImagePreview(initialData.image);
      }
    }
  }, [initialData]);

  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
      }
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!form.title) {
      showToast('Please provide a banner title', 'error');
      return;
    }

    if (!initialData && !mainImage) {
      showToast('Please upload a banner image', 'error');
      return;
    }

    // Prepare data
    const formData = {
      title: form.title,
      subtitle: form.subtitle,
      link: form.link,
    };

    if (mainImage) {
      formData.image = mainImage;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="admin-form-group">
          <label>Banner Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g., Summer Collection 2026"
            required
            disabled={submitting}
          />
          <small style={{ color: '#666' }}>Main heading text displayed on the banner</small>
        </div>
      </div>

      <div className="admin-form-group">
        <label>Banner Subtitle</label>
        <input
          type="text"
          value={form.subtitle}
          onChange={(e) => setForm(f => ({ ...f, subtitle: e.target.value }))}
          placeholder="e.g., Where heritage meets modern luxury"
          disabled={submitting}
        />
        <small style={{ color: '#666' }}>Optional subtitle or tagline</small>
      </div>

      <div className="form-row">
        <div className="admin-form-group">
          <label>Banner Link (Optional)</label>
          <input
            type="text"
            value={form.link}
            onChange={(e) => setForm(f => ({ ...f, link: e.target.value }))}
            placeholder="e.g., /women or /new"
            disabled={submitting}
          />
          <small style={{ color: '#666' }}>URL to navigate when banner is clicked</small>
        </div>
      </div>

      <div className="admin-form-group">
        <label>Banner Image {!initialData && '*'}</label>
        <label className="image-upload-box">
          <FaCloudUploadAlt size={20} style={{ marginBottom: 6 }} />
          <br />
          Click to upload banner image
          <input 
            type="file" 
            accept="image/*" 
            hidden 
            onChange={handleMainImageChange}
            disabled={submitting}
          />
        </label>
        {mainImagePreview && (
          <div className="image-preview-strip">
            <img src={mainImagePreview} alt="Banner preview" style={{ maxHeight: '200px' }} />
          </div>
        )}
        <small style={{ color: '#666' }}>
          Recommended size: 1920×600px | Max 5MB
          {initialData && ' | Leave empty to keep current image'}
        </small>
      </div>

      <div className="row-actions" style={{ gap: 12, marginTop: 20 }}>
        <button type="submit" className="admin-btn admin-btn-gold" disabled={submitting}>
          {submitLabel}
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-outline"
          onClick={() => window.history.back()}
          disabled={submitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
