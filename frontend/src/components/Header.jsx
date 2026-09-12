import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { FaSearch, FaHeart, FaShoppingBag, FaUser, FaBars, FaUserCircle, FaClipboardList, FaUserEdit, FaMoon, FaSun } from "react-icons/fa";
import logoFallback from "../assets/logo.png";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { logout as logoutService, getStoredUser, isAuthenticated } from "../services/authService";
import { useSettings } from "../context/SettingsContext";
import SearchBar from "./SearchBar";
import MobileMenu from "./MobileMenu";
import "./style/Header.css";

const NAV_LINKS = [
  { to: "/women", label: "Women" },
  { to: "/men", label: "Men" },
  { to: "/kids", label: "Kids" },
  { to: "/combo", label: "Combo" },
  { to: "/new", label: "New Arrivals" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('userDarkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const { settings } = useSettings();
  const navigate = useNavigate();

  // Get user from auth service and listen for changes
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  // Update user state when component mounts or when login status changes
  useEffect(() => {
    const updateUser = (event) => {
      const storedUser = getStoredUser();
      const authStatus = isAuthenticated();
      
      // If it's a custom event with user data, use that directly
      const userData = event?.detail || storedUser;
      
      console.log('🔄 Updating user state:', { userData, storedUser, authStatus, eventType: event?.type }); // Debug log
      
      setUser(userData);
      setIsLoggedIn(authStatus);
    };

    // Initial load
    updateUser();

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', updateUser);
    
    // Custom event listener for login/logout in same tab
    window.addEventListener('userChanged', updateUser);

    return () => {
      window.removeEventListener('storage', updateUser);
      window.removeEventListener('userChanged', updateUser);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('userDarkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountOpen && !event.target.closest('.account-menu')) {
        setAccountOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [accountOpen]);

  const handleLogout = async () => {
    await logoutService();
    setAccountOpen(false);
    navigate("/");
    window.location.reload(); // Refresh to update UI
  };

  return (
    <>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="site-header-inner container">
          <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <FaBars />
          </button>

          <Link to="/" className="brand">
            <img
              src={settings.logo || logoFallback}
              alt={settings.storeName}
              onError={(e) => { e.currentTarget.src = logoFallback; }}
            />
            <span className="brand-text">
              <strong>{settings.storeName.split(" ")[0]}</strong>
              <em>{settings.storeName.split(" ").slice(1).join(" ") || "Textiles"}</em>
            </span>
          </Link>

          <nav className="main-nav" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-icons">
            <button aria-label="Search" onClick={() => setSearchOpen(true)}>
              <FaSearch />
            </button>

            {/* Dark Mode Toggle */}
            <button 
              className="theme-toggle-btn" 
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              onClick={toggleDarkMode}
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            <Link to={isLoggedIn ? "/wishlist" : "/login?redirect=%2Fwishlist"} aria-label="Wishlist" className="icon-link">
              <FaHeart />
              {wishlist.length > 0 && <span className="icon-count">{wishlist.length}</span>}
            </Link>

            <Link to={isLoggedIn ? "/cart" : "/login?redirect=%2Fcart"} aria-label="Cart" className="icon-link">
              <FaShoppingBag />
              {totalItems > 0 && <span className="icon-count">{totalItems}</span>}
            </Link>

            {/* Account/Profile Section */}
            <div className="account-menu">
              {isLoggedIn ? (
                <>
                  <button
                    className="profile-btn"
                    aria-label="Account"
                    onClick={() => setAccountOpen((o) => !o)}
                  >
                    <FaUserCircle className="profile-icon" />
                    <span className="profile-name">{user?.name}</span>
                  </button>
                  {accountOpen && (
                    <div className="account-dropdown fade-up">
                      <div className="account-header">
                        <FaUserCircle className="dropdown-avatar" />
                        <div>
                          <p className="dropdown-name">{user?.name}</p>
                          <p className="dropdown-email">{user?.email}</p>
                        </div>
                      </div>
                      <div className="account-links">
                        <Link to="/profile" onClick={() => setAccountOpen(false)}>
                          <FaUserEdit /> My Profile
                        </Link>
                        <Link to="/orders" onClick={() => setAccountOpen(false)}>
                          <FaClipboardList /> Order History
                        </Link>
                        <Link to="/wishlist" onClick={() => setAccountOpen(false)}>
                          <FaHeart /> My Wishlist
                        </Link>
                        <Link to="/cart" onClick={() => setAccountOpen(false)}>
                          <FaShoppingBag /> My Cart
                        </Link>
                        {user?.role === 'admin' && (
                          <Link to="/admin/dashboard" onClick={() => setAccountOpen(false)}>
                            Admin Panel
                          </Link>
                        )}
                      </div>
                      <button className="logout-btn" onClick={handleLogout}>
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/login" className="login-btn" aria-label="Login">
                  <FaUser />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} links={NAV_LINKS} />
    </>
  );
}
