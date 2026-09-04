import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaBars, FaBell, FaSearch, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { logout as logoutService, getStoredUser } from "../../services/authService";
import { useSettings } from "../../context/SettingsContext";
import logoFallback from "../../assets/logo.png";
import "../Style/AdminNavbar.css";

const SAMPLE_NOTIFICATIONS = [
  { id: 1, text: "New order #PT10234 has been placed", time: "5 min ago" },
  { id: 2, text: "Kanchipuram Silk Saree is low on stock", time: "1 hr ago" },
  { id: 3, text: "New 5-star review on Banarasi Silk Saree", time: "3 hr ago" },
];

export default function AdminNavbar({ onMenuClick }) {
  const navigate = useNavigate();
  const admin = getStoredUser();
  const { settings } = useSettings();
  
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutService();
      // Force page reload to clear all state
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, clear local storage and redirect
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  return (
    <header className="admin-navbar">
      <button className="menu-btn" onClick={onMenuClick} aria-label="Open menu">
        <FaBars />
      </button>

      {/* Admin logo stays inside the dashboard */}
      <Link to="/admin/dashboard" className="admin-navbar-logo" aria-label="Admin dashboard">
        <img
          src={settings.logo || logoFallback}
          alt={settings.storeName}
          onError={(e) => { e.currentTarget.src = logoFallback; }}
        />
        <span>{settings.storeName}</span>
      </Link>

      <form
        className="admin-search"
        onSubmit={(e) => e.preventDefault()}
        role="search"
      >
        <FaSearch />
        <input
          type="text"
          placeholder="Search products, orders, customers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      <div className="admin-navbar-right">
        <div className="navbar-icon-wrap" ref={notifRef}>
          <button
            className="navbar-icon-btn"
            onClick={() => setNotifOpen((o) => !o)}
            aria-label="Notifications"
          >
            <FaBell />
            <span className="notif-dot">{SAMPLE_NOTIFICATIONS.length}</span>
          </button>

          {notifOpen && (
            <div className="dropdown-panel notif-panel">
              <div className="dropdown-header">Notifications</div>
              {SAMPLE_NOTIFICATIONS.map((n) => (
                <div className="notif-item" key={n.id}>
                  <p>{n.text}</p>
                  <span>{n.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="navbar-icon-wrap" ref={profileRef}>
          <button
            className="admin-profile-btn"
            onClick={() => setProfileOpen((o) => !o)}
          >
            <FaUserCircle className="profile-avatar" />
            <span className="profile-name">{admin?.name || "Admin"}</span>
          </button>

          {profileOpen && (
            <div className="dropdown-panel profile-panel">
              <div className="dropdown-header">
                <strong>{admin?.name || "Admin"}</strong>
                <span>{admin?.email || "admin@priyatextiles.com"}</span>
              </div>
              <button className="dropdown-item" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
