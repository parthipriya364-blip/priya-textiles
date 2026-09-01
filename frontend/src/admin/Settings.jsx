import { useState, useEffect } from "react";
import { FaSave, FaSpinner, FaUndo, FaUpload, FaTrash, FaImage } from "react-icons/fa";
import AdminPageHeader from "./components/AdminPageHeader";
import { getSettings, updateSettings, resetSettings, uploadLogo, deleteLogo } from "../services/settingsService";
import "./admin-forms.css";

const initialSettings = {
  storeName: "Priya Textiles",
  storeEmail: "support@priyatextiles.com",
  phone: "+91 98765 43210",
  address: "Coimbatore, Tamil Nadu, India",
  instagram: "instagram.com/priyatextiles",
  facebook: "facebook.com/priyatextiles",
  youtube: "",
  whatsapp: "",
  gstNumber: "",
  shippingCharge: "0",
  storeDescription: "",
  businessHours: {
    monday: "9:00 AM - 6:00 PM",
    tuesday: "9:00 AM - 6:00 PM",
    wednesday: "9:00 AM - 6:00 PM",
    thursday: "9:00 AM - 6:00 PM",
    friday: "9:00 AM - 6:00 PM",
    saturday: "9:00 AM - 6:00 PM",
    sunday: "Closed",
  },
};

export default function Settings() {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await getSettings();
      setSettings({
        storeName: response.settings.storeName || "",
        storeEmail: response.settings.storeEmail || "",
        phone: response.settings.phone || "",
        address: response.settings.address || "",
        instagram: response.settings.instagram || "",
        facebook: response.settings.facebook || "",
        youtube: response.settings.youtube || "",
        whatsapp: response.settings.whatsapp || "",
        gstNumber: response.settings.gstNumber || "",
        shippingCharge: String(response.settings.shippingCharge || 0),
        storeDescription: response.settings.storeDescription || "",
        businessHours: response.settings.businessHours || {
          monday: "9:00 AM - 6:00 PM",
          tuesday: "9:00 AM - 6:00 PM",
          wednesday: "9:00 AM - 6:00 PM",
          thursday: "9:00 AM - 6:00 PM",
          friday: "9:00 AM - 6:00 PM",
          saturday: "9:00 AM - 6:00 PM",
          sunday: "Closed",
        },
      });
      setLogoPreview(response.settings.logo || "");
      setError("");
    } catch (err) {
      console.error("Failed to load settings:", err);
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const update = (key, value) => {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
    setError("");
  };

  const updateBusinessHours = (day, value) => {
    setSettings((s) => ({
      ...s,
      businessHours: {
        ...s.businessHours,
        [day]: value,
      },
    }));
    setSaved(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError("");
      
      await updateSettings({
        storeName: settings.storeName,
        storeEmail: settings.storeEmail,
        phone: settings.phone,
        address: settings.address,
        instagram: settings.instagram,
        facebook: settings.facebook,
        youtube: settings.youtube,
        whatsapp: settings.whatsapp,
        gstNumber: settings.gstNumber,
        shippingCharge: Number(settings.shippingCharge),
        storeDescription: settings.storeDescription,
        businessHours: settings.businessHours,
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all settings to default values?")) {
      return;
    }

    try {
      setResetting(true);
      setError("");
      await resetSettings();
      await loadSettings();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to reset settings:", err);
      setError(err.message || "Failed to reset settings");
    } finally {
      setResetting(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) {
      setError("Please select a logo image first");
      return;
    }

    try {
      setUploading(true);
      setError("");
      const response = await uploadLogo(logoFile);
      setLogoPreview(response.logo);
      setLogoFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to upload logo:", err);
      setError(err.message || "Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleLogoDelete = async () => {
    if (!confirm("Are you sure you want to delete the logo?")) {
      return;
    }

    try {
      setUploading(true);
      setError("");
      await deleteLogo();
      setLogoPreview("");
      setLogoFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to delete logo:", err);
      setError(err.message || "Failed to delete logo");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <AdminPageHeader title="Settings" subtitle="Manage your store information" />
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <FaSpinner className="spinner" style={{ fontSize: "32px", color: "#8B0000" }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader title="Settings" subtitle="Manage your store information" />

      <div className="admin-form-card" style={{ maxWidth: 720 }}>
        <form onSubmit={handleSubmit}>
          {/* Store Information Section */}
          <h3 style={{ marginBottom: '20px', color: '#111827', fontSize: '18px', fontWeight: 600, borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            Store Information
          </h3>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => update("storeName", e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Store Email</label>
              <input
                type="email"
                value={settings.storeEmail}
                onChange={(e) => update("storeEmail", e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => update("phone", e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>GST Number</label>
              <input
                type="text"
                value={settings.gstNumber}
                onChange={(e) => update("gstNumber", e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="admin-form-group full">
              <label>Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => update("address", e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group full">
              <label>Store Description</label>
              <textarea
                value={settings.storeDescription}
                onChange={(e) => update("storeDescription", e.target.value)}
                placeholder="Brief description about your store..."
                rows="4"
                style={{ resize: 'vertical', fontFamily: 'inherit', padding: '10px', fontSize: '14px' }}
              />
            </div>
          </div>

          {/* Logo Upload Section */}
          <h3 style={{ margin: '30px 0 20px', color: '#111827', fontSize: '18px', fontWeight: 600, borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            Store Logo
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap', marginBottom: '8px' }}>
            {/* Preview Box */}
            <div
              style={{
                width: 120,
                height: 120,
                border: '1.5px dashed #d1d5db',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f9fafb',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Store Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                  <FaImage style={{ fontSize: 32, marginBottom: 6 }} />
                  <p style={{ fontSize: 11, fontFamily: 'inherit', margin: 0 }}>No Logo</p>
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontSize: 12.5, color: '#6b7280', marginBottom: 12, fontFamily: 'inherit' }}>
                Recommended: square image (PNG/SVG), max 5MB
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <label
                  htmlFor="logo-upload"
                  className="admin-btn admin-btn-outline"
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <FaUpload />
                  {logoFile ? logoFile.name.slice(0, 20) + (logoFile.name.length > 20 ? '…' : '') : 'Choose Image'}
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleLogoChange}
                />

                {logoFile && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-gold"
                    onClick={handleLogoUpload}
                    disabled={uploading}
                  >
                    {uploading ? <FaSpinner className="spinner" /> : <FaUpload />}
                    {uploading ? 'Uploading…' : 'Upload Logo'}
                  </button>
                )}

                {logoPreview && !logoFile && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-outline"
                    onClick={handleLogoDelete}
                    disabled={uploading}
                    style={{ color: '#dc2626', borderColor: '#dc2626' }}
                  >
                    {uploading ? <FaSpinner className="spinner" /> : <FaTrash />}
                    Remove Logo
                  </button>
                )}
              </div>

              {logoFile && (
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8, fontFamily: 'inherit' }}>
                  Click <strong>Upload Logo</strong> to save the selected image.
                </p>
              )}
            </div>
          </div>

          {/* Social Media Section */}
          <h3 style={{ margin: '30px 0 20px', color: '#111827', fontSize: '18px', fontWeight: 600, borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            Social Media Links
          </h3>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>Instagram URL</label>
              <input
                type="text"
                value={settings.instagram}
                onChange={(e) => update("instagram", e.target.value)}
                placeholder="https://instagram.com/yourstore"
              />
            </div>

            <div className="admin-form-group">
              <label>Facebook URL</label>
              <input
                type="text"
                value={settings.facebook}
                onChange={(e) => update("facebook", e.target.value)}
                placeholder="https://facebook.com/yourstore"
              />
            </div>

            <div className="admin-form-group">
              <label>YouTube URL</label>
              <input
                type="text"
                value={settings.youtube}
                onChange={(e) => update("youtube", e.target.value)}
                placeholder="https://youtube.com/@yourstore"
              />
            </div>

            <div className="admin-form-group">
              <label>WhatsApp Number</label>
              <input
                type="text"
                value={settings.whatsapp}
                onChange={(e) => update("whatsapp", e.target.value)}
                placeholder="919876543210 (with country code)"
              />
            </div>
          </div>

          {/* Business Hours Section */}
          <h3 style={{ margin: '30px 0 20px', color: '#111827', fontSize: '18px', fontWeight: 600, borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            Business Hours
          </h3>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>Monday</label>
              <input
                type="text"
                value={settings.businessHours.monday}
                onChange={(e) => updateBusinessHours("monday", e.target.value)}
                placeholder="9:00 AM - 6:00 PM"
              />
            </div>

            <div className="admin-form-group">
              <label>Tuesday</label>
              <input
                type="text"
                value={settings.businessHours.tuesday}
                onChange={(e) => updateBusinessHours("tuesday", e.target.value)}
                placeholder="9:00 AM - 6:00 PM"
              />
            </div>

            <div className="admin-form-group">
              <label>Wednesday</label>
              <input
                type="text"
                value={settings.businessHours.wednesday}
                onChange={(e) => updateBusinessHours("wednesday", e.target.value)}
                placeholder="9:00 AM - 6:00 PM"
              />
            </div>

            <div className="admin-form-group">
              <label>Thursday</label>
              <input
                type="text"
                value={settings.businessHours.thursday}
                onChange={(e) => updateBusinessHours("thursday", e.target.value)}
                placeholder="9:00 AM - 6:00 PM"
              />
            </div>

            <div className="admin-form-group">
              <label>Friday</label>
              <input
                type="text"
                value={settings.businessHours.friday}
                onChange={(e) => updateBusinessHours("friday", e.target.value)}
                placeholder="9:00 AM - 6:00 PM"
              />
            </div>

            <div className="admin-form-group">
              <label>Saturday</label>
              <input
                type="text"
                value={settings.businessHours.saturday}
                onChange={(e) => updateBusinessHours("saturday", e.target.value)}
                placeholder="9:00 AM - 6:00 PM"
              />
            </div>

            <div className="admin-form-group">
              <label>Sunday</label>
              <input
                type="text"
                value={settings.businessHours.sunday}
                onChange={(e) => updateBusinessHours("sunday", e.target.value)}
                placeholder="Closed"
              />
            </div>
          </div>

          {/* Shipping Section */}
          <h3 style={{ margin: '30px 0 20px', color: '#111827', fontSize: '18px', fontWeight: 600, borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            Shipping Configuration
          </h3>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>Shipping Charge (₹)</label>
              <input
                type="number"
                min="0"
                value={settings.shippingCharge}
                onChange={(e) => update("shippingCharge", e.target.value)}
              />
            </div>
          </div>

          {error && <p className="settings-error" style={{color: '#dc2626', marginBottom: '15px'}}>{error}</p>}
          {saved && <p className="settings-saved">Settings saved successfully.</p>}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="admin-btn admin-btn-gold" disabled={saving || resetting}>
              <FaSave /> {saving ? "Saving..." : "Save Settings"}
            </button>
            <button 
              type="button" 
              onClick={handleReset} 
              className="admin-btn admin-btn-outline"
              disabled={saving || resetting}
            >
              <FaUndo /> {resetting ? "Resetting..." : "Reset to Default"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
