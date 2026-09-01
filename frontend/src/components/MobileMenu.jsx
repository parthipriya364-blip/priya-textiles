import { NavLink, Link } from "react-router-dom";
import { FaTimes, FaUser, FaHeart, FaShoppingBag } from "react-icons/fa";
import logoFallback from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import "./style/MobileMenu.css";

export default function MobileMenu({ open, onClose, links }) {
  const { user } = useAuth();
  const { settings } = useSettings();

  return (
    <div className={`mobile-menu ${open ? "is-open" : ""}`}>
      <div className="mobile-menu-backdrop" onClick={onClose} />
      <div className="mobile-menu-panel">
        <div className="mobile-menu-top">
          <Link to="/" onClick={onClose} className="brand">
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
          <button onClick={onClose} aria-label="Close menu">
            <FaTimes />
          </button>
        </div>

        <nav className="mobile-menu-links">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={onClose} className={({ isActive }) => (isActive ? "active" : "")}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="mobile-menu-footer">
          <Link to={user ? "/wishlist" : "/login"} onClick={onClose}>
            <FaUser /> {user ? `Hi, ${user.name}` : "Login / Register"}
          </Link>
          <Link to="/wishlist" onClick={onClose}>
            <FaHeart /> Wishlist
          </Link>
          <Link to="/cart" onClick={onClose}>
            <FaShoppingBag /> Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
