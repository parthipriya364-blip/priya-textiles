import { useState, useEffect } from "react";
import { FaSave, FaSpinner, FaUndo } from "react-icons/fa";
import AdminPageHeader from "./components/AdminPageHeader";
import { getSettings, updateSettings, resetSettings } from "../services/settingsService";
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
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

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
