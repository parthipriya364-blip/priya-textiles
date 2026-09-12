import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt, FaMoon, FaSun } from "react-icons/fa";
import { logout as logoutService, getStoredUser } from "../../services/authService";
import { useSettings } from "../../context/SettingsContext";
import logoFallback from "../../assets/logo.png";
import "../Style/AdminNavbar.css";

export default function AdminNavbar({ onMenuClick }) {
  const navigate = useNavigate();
  const admin = getStoredUser();
  const { settings } = useSettings();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('adminDarkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  // Search suggestions data - all admin menu items
  const searchSuggestions = [
    { title: 'Dashboard', description: 'View analytics and statistics', path: '/admin/dashboard', icon: '📊' },
    { title: 'Products', description: 'Manage your products', path: '/admin/products', icon: '📦' },
    { title: 'Add Product', description: 'Add a new product', path: '/admin/products/add', icon: '➕' },
    { title: 'Categories', description: 'Manage product categories', path: '/admin/categories', icon: '🏷️' },
    { title: 'Orders', description: 'View and manage orders', path: '/admin/orders', icon: '🛒' },
    { title: 'Customers', description: 'View customer list', path: '/admin/customers', icon: '👥' },
    { title: 'Reviews', description: 'Manage product reviews', path: '/admin/reviews', icon: '⭐' },
    { title: 'Revenue', description: 'View revenue analytics', path: '/admin/revenue', icon: '💰' },
    { title: 'Banners', description: 'Manage homepage banners', path: '/admin/banners', icon: '🖼️' },
    { title: 'Add Banner', description: 'Add a new banner', path: '/admin/banners/add', icon: '➕' },
    { title: 'Settings', description: 'Configure store settings', path: '/admin/settings', icon: '⚙️' },
    { title: 'Test Notifications', description: 'Test Socket.IO notifications', path: '/admin/test-notifications', icon: '🧪' },
  ];

  // Filter suggestions based on query
  const filteredSuggestions = query.trim()
    ? searchSuggestions.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    const onClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('adminDarkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

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

  const handleSearchSelect = (path) => {
    navigate(path);
    setQuery('');
    setSearchOpen(false);
  };

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
    setSearchOpen(true);
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
        ref={searchRef}
      >
        <FaSearch />
        <input
          type="text"
          placeholder="Search pages, features..."
          value={query}
          onChange={handleSearchChange}
          onFocus={() => setSearchOpen(true)}
        />
        
        {/* Search Suggestions Dropdown */}
        {searchOpen && filteredSuggestions.length > 0 && (
          <div className="search-suggestions">
            {filteredSuggestions.map((item, index) => (
              <div
                key={index}
                className="search-suggestion-item"
                onClick={() => handleSearchSelect(item.path)}
              >
                <span className="suggestion-icon">{item.icon}</span>
                <div className="suggestion-content">
                  <div className="suggestion-title">{item.title}</div>
                  <div className="suggestion-desc">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* No Results Message */}
        {searchOpen && query.trim() && filteredSuggestions.length === 0 && (
          <div className="search-suggestions">
            <div className="search-no-results">
              <FaSearch style={{ opacity: 0.3, marginBottom: '8px' }} />
              <p>No results found</p>
              <span>Try searching for products, orders, or customers</span>
            </div>
          </div>
        )}
      </form>

      <div className="admin-navbar-right">
        {/* Dark Mode Toggle */}
        <div className="navbar-icon-wrap">
          <button
            className="navbar-icon-btn theme-toggle"
            onClick={toggleDarkMode}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            title={darkMode ? "Light Mode" : "Dark Mode"}
          >
            {darkMode ? (
              <FaSun style={{ color: '#fbbf24' }} />
            ) : (
              <FaMoon style={{ color: '#6b7280' }} />
            )}
          </button>
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
