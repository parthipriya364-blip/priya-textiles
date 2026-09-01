import { NavLink } from "react-router-dom";
import {
  FaChartPie,
  FaBoxOpen,
  FaLayerGroup,
  FaClipboardList,
  FaUsers,
  FaStar,
  FaChartLine,
  FaCog,
  FaImages,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import "../Style/AdminSidebar.css";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: <FaChartPie /> },
  { to: "/admin/products", label: "Products", icon: <FaBoxOpen /> },
  { to: "/admin/categories", label: "Categories", icon: <FaLayerGroup /> },
  { to: "/admin/orders", label: "Orders", icon: <FaClipboardList /> },
  { to: "/admin/customers", label: "Customers", icon: <FaUsers /> },
  { to: "/admin/reviews", label: "Reviews", icon: <FaStar /> },
  { to: "/admin/revenue", label: "Revenue", icon: <FaChartLine /> },
  { to: "/admin/settings", label: "Settings", icon: <FaCog /> },
  { to: "/admin/banners", label: "Banners", icon: <FaImages /> },
];

export default function AdminSidebar({ open, onClose }) {
  const { logout } = useAuth();
  const { settings } = useSettings();

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <img
            src={settings.logo || logo}
            alt={settings.storeName}
            onError={(e) => { e.currentTarget.src = logo; }}
          />
          <div>
            <h2>
              {settings.storeName.split(" ")[0]}{" "}
              <span>{settings.storeName.split(" ").slice(1).join(" ") || "Textiles"}</span>
            </h2>
            <p>Admin Panel</p>
          </div>
          <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={logout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>
    </>
  );
}
