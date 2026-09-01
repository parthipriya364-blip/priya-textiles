import { useState, useEffect } from "react";
import { FaUserEdit, FaLock, FaSave, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { getStoredUser, updateProfile, updatePassword } from "../services/authService";
import { useToast } from "../context/ToastContext";
import "./style/Auth.css";
import "./style/Profile.css";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const [user, setUser] = useState(null);

  // Personal Info Form
  const [personalData, setPersonalData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Address Form
  const [addressData, setAddressData] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  // Password Form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load user data on mount
  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    
    if (storedUser) {
      setPersonalData({
        name: storedUser.name || "",
        email: storedUser.email || "",
        phone: storedUser.phone || "",
      });

      if (storedUser.address) {
        setAddressData({
          street: storedUser.address.street || "",
          city: storedUser.address.city || "",
          state: storedUser.address.state || "",
          zipCode: storedUser.address.zipCode || "",
          country: storedUser.address.country || "",
        });
      }
    }
  }, []);

  // Handle personal info change
  const handlePersonalChange = (e) => {
    setPersonalData({
      ...personalData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle address change
  const handleAddressChange = (e) => {
    setAddressData({
      ...addressData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit personal info
  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await updateProfile({
        name: personalData.name,
        email: personalData.email,
        phone: personalData.phone,
      });

      if (response.success) {
        showToast("Profile updated successfully!", "success");
      }
    } catch (error) {
      showToast(error.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  // Submit address
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await updateProfile({
        address: addressData,
      });

      if (response.success) {
        showToast("Address updated successfully!", "success");
      }
    } catch (error) {
      showToast(error.message || "Failed to update address", "error");
    } finally {
      setLoading(false);
    }
  };

  // Submit password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast("New password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        showToast("Password updated successfully!", "success");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      showToast(error.message || "Failed to update password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            <FaUser />
          </div>
          <div className="profile-info">
            <h1>{user?.name}</h1>
            <p>{user?.email}</p>
            <span className="profile-badge">{user?.role === 'admin' ? 'Admin' : 'Customer'}</span>
          </div>
        </div>

        <div className="profile-content">
          {/* Tabs */}
          <div className="profile-tabs">
            <button
              className={`profile-tab ${activeTab === "personal" ? "active" : ""}`}
              onClick={() => setActiveTab("personal")}
            >
              <FaUserEdit /> Personal Info
            </button>
            <button
              className={`profile-tab ${activeTab === "address" ? "active" : ""}`}
              onClick={() => setActiveTab("address")}
            >
              <FaMapMarkerAlt /> Address
            </button>
            {!user?.isGoogleUser && (
              <button
                className={`profile-tab ${activeTab === "password" ? "active" : ""}`}
                onClick={() => setActiveTab("password")}
              >
                <FaLock /> Change Password
              </button>
            )}
          </div>

          {/* Personal Info Tab */}
          {activeTab === "personal" && (
            <div className="profile-tab-content">
              <form className="auth-form" onSubmit={handlePersonalSubmit}>
                <h2 className="profile-section-title">Personal Information</h2>

                <div className="form-group">
                  <label htmlFor="name">
                    <FaUser /> Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={personalData.name}
                    onChange={handlePersonalChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <FaEnvelope /> Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={personalData.email}
                    onChange={handlePersonalChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    <FaPhone /> Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={personalData.phone}
                    onChange={handlePersonalChange}
                    placeholder="Enter 10-digit phone number"
                    pattern="[0-9]{10}"
                    title="Please enter a valid 10-digit phone number"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary auth-submit"
                  disabled={loading}
                >
                  <FaSave /> {loading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          )}

          {/* Address Tab */}
          {activeTab === "address" && (
            <div className="profile-tab-content">
              <form className="auth-form" onSubmit={handleAddressSubmit}>
                <h2 className="profile-section-title">Shipping Address</h2>

                <div className="form-group">
                  <label htmlFor="street">Street Address</label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={addressData.street}
                    onChange={handleAddressChange}
                    placeholder="Enter street address"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={addressData.city}
                      onChange={handleAddressChange}
                      placeholder="City"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={addressData.state}
                      onChange={handleAddressChange}
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="zipCode">ZIP Code</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={addressData.zipCode}
                      onChange={handleAddressChange}
                      placeholder="ZIP Code"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={addressData.country}
                      onChange={handleAddressChange}
                      placeholder="Country"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary auth-submit"
                  disabled={loading}
                >
                  <FaSave /> {loading ? "Saving..." : "Save Address"}
                </button>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && !user?.isGoogleUser && (
            <div className="profile-tab-content">
              <form className="auth-form" onSubmit={handlePasswordSubmit}>
                <h2 className="profile-section-title">Change Password</h2>

                <div className="form-group">
                  <label htmlFor="currentPassword">
                    <FaLock /> Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">
                    <FaLock /> New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password (min 6 characters)"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    <FaLock /> Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary auth-submit"
                  disabled={loading}
                >
                  <FaSave /> {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
