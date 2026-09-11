import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaBars, FaBell, FaSearch, FaUserCircle, FaSignOutAlt, FaCheckDouble, FaTrash } from "react-icons/fa";
import { logout as logoutService, getStoredUser } from "../../services/authService";
import { useSettings } from "../../context/SettingsContext";
import { useSocket } from "../../context/SocketContext";
import logoFallback from "../../assets/logo.png";
import "../Style/AdminNavbar.css";

export default function AdminNavbar({ onMenuClick }) {
  const navigate = useNavigate();
  const admin = getStoredUser();
  const { settings } = useSettings();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications, connected } = useSocket();
  
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const notifRef = useRef(null);
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
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
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

  const handleLogout = async () => {
    try {
      await logoutService();
      // Force page reload to clear all state
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'payment':
        return '💰';
      case 'order-update':
        return '📋';
      case 'stock':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    const orderId = notification.data?.orderId;
    const orderPath = orderId
      ? `/admin/orders?orderId=${encodeURIComponent(orderId)}`
      : '/admin/orders';

    // Navigate based on notification type
    if (notification.type === 'order' || notification.type === 'order-update' || notification.type === 'payment') {
      navigate(orderPath);
      setNotifOpen(false);
    } else if (notification.type === 'stock') {
      navigate('/admin/products');
      setNotifOpen(false);
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

      {/* Store logo — links back to storefront */}
      <Link to="/" className="admin-navbar-logo" aria-label="View store">
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
        <div className="navbar-icon-wrap" ref={notifRef}>
          <button
            className="navbar-icon-btn"
            onClick={() => setNotifOpen((o) => !o)}
            aria-label="Notifications"
          >
            <FaBell />
            {unreadCount > 0 && <span className="notif-dot">{unreadCount}</span>}
            {connected && <span className="connection-indicator" title="Connected"></span>}
          </button>

          {notifOpen && (
            <div className="dropdown-panel notif-panel">
              <div className="dropdown-header">
                <span>Notifications</span>
                {notifications.length > 0 && (
                  <div className="notif-actions">
                    <button 
                      className="notif-action-btn" 
                      onClick={markAllAsRead}
                      title="Mark all as read"
                    >
                      <FaCheckDouble />
                    </button>
                    <button 
                      className="notif-action-btn" 
                      onClick={clearNotifications}
                      title="Clear all"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
              
              {notifications.length === 0 ? (
                <div className="notif-empty">
                  <FaBell style={{ fontSize: '32px', opacity: 0.3, marginBottom: '8px' }} />
                  <p>No notifications yet</p>
                  <span>You'll be notified about new orders and updates</span>
                </div>
              ) : (
                <div className="notif-list">
                  {notifications.map((n) => (
                    <div 
                      className={`notif-item ${n.read ? 'read' : 'unread'}`} 
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="notif-icon">{getNotificationIcon(n.type)}</div>
                      <div className="notif-content">
                        <div className="notif-title">{n.title}</div>
                        <p>{n.message}</p>
                        <span className="notif-time">{formatTimeAgo(n.time)}</span>
                      </div>
                      {!n.read && <div className="notif-unread-dot"></div>}
                    </div>
                  ))}
                </div>
              )}
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
