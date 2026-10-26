import { useState, useEffect } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useToast } from "../../context/ToastContext";

export default function BannerForm({ initialData, onSubmit, submitLabel = "Save", submitting = false }) {
  const { showToast } = useToast();
  
  const [form, setForm] = useState({
    link: '',
  });

  const [desktopImage, setDesktopImage] = useState(null);
  const [desktopImagePreview, setDesktopImagePreview] = useState('');
  
  const [mobileImage, setMobileImage] = useState(null);
  const [mobileImagePreview, setMobileImagePreview] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        link: initialData.link || '',
      });
      if (initialData.image?.url) {
        setDesktopImagePreview(initialData.image.url);
      } else if (initialData.image) {
        setDesktopImagePreview(initialData.image);
      }
      if (initialData.mobileImage?.url) {
        setMobileImagePreview(initialData.mobileImage.url);
      } else if (initialData.mobileImage) {
        setMobileImagePreview(initialData.mobileImage);
      }
    }
  }, [initialData]);

  const handleDesktopImageChange = (e) => {
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
      setDesktopImage(file);
      setDesktopImagePreview(URL.createObjectURL(file));
    }
  };

  const handleMobileImageChange = (e) => {
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
      setMobileImage(file);
      setMobileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!initialData && (!desktopImage || !mobileImage)) {
      showToast('Please upload both desktop and mobile banner images', 'error');
      return;
    }

    // Prepare data
    const formData = {
      link: form.link,
    };

    if (desktopImage) {
      formData.desktopImage = desktopImage;
    }
    
    if (mobileImage) {
      formData.mobileImage = mobileImage;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
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
        <label>Desktop Banner Image (1920×600 recommended) {!initialData && '*'}</label>
        <label className="image-upload-box">
          <FaCloudUploadAlt size={20} style={{ marginBottom: 6 }} />
          <br />
          Click to upload desktop banner image
          <input 
            type="file" 
            accept="image/*" 
            hidden 
            onChange={handleDesktopImageChange}
            disabled={submitting}
          />
        </label>
        {desktopImagePreview && (
          <div className="image-preview-strip">
            <img
              src={desktopImagePreview}
              alt="Desktop banner preview"
              style={{ width: '100%', aspectRatio: '16 / 5', objectFit: 'cover', objectPosition: 'center', maxHeight: '260px' }}
            />
          </div>
        )}
        <small style={{ color: '#666' }}>
          Recommended size: 1920×600px | Max 5MB
          {initialData && ' | Leave empty to keep current image'}
        </small>
      </div>

      <div className="admin-form-group">
        <label>Mobile Banner Image (768×600 recommended) {!initialData && '*'}</label>
        <label className="image-upload-box">
          <FaCloudUploadAlt size={20} style={{ marginBottom: 6 }} />
          <br />
          Click to upload mobile banner image
          <input 
            type="file" 
            accept="image/*" 
            hidden 
            onChange={handleMobileImageChange}
            disabled={submitting}
          />
        </label>
        {mobileImagePreview && (
          <div className="image-preview-strip">
            <img
              src={mobileImagePreview}
              alt="Mobile banner preview"
              style={{ width: '100%', aspectRatio: '16 / 5', objectFit: 'cover', objectPosition: 'center', maxHeight: '260px' }}
            />
          </div>
        )}
        <small style={{ color: '#666' }}>
          Recommended size: 768×600px | Max 5MB
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
