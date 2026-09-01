import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaWhatsapp, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock } from "react-icons/fa";
import { useSettings } from "../context/SettingsContext";
import logoFallback from "../assets/logo.png";
import "./style/Footer.css";

export default function Footer() {
  const { settings } = useSettings();

  const getBusinessHours = () => {
    const hours = settings.businessHours;
    if (!hours || Object.keys(hours).length === 0) {
      return "Mon – Sat, 09:00 AM – 10:00 PM";
    }
    const weekdayHours = [
      hours.monday,
      hours.tuesday,
      hours.wednesday,
      hours.thursday,
      hours.friday,
      hours.saturday,
    ].filter(Boolean);

    const allSame = weekdayHours.every((h) => h === weekdayHours[0]);
    if (allSame && weekdayHours[0]) return `Mon – Sat, ${weekdayHours[0]}`;
    return hours.monday || hours.tuesday || "9:00 AM – 6:00 PM";
  };

  const storeWords = settings.storeName.split(" ");
  const storePrimary = storeWords[0];
  const storeSecondary = storeWords.slice(1).join(" ") || "Textiles";

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        {/* Brand */}
        <div className="footer-brand">
          <Link to="/" className="brand">
            <img
              src={settings.logo || logoFallback}
              alt={settings.storeName}
              onError={(e) => { e.currentTarget.src = logoFallback; }}
            />
            <span className="brand-text">
              <strong>{storePrimary}</strong>
              <em>{storeSecondary}</em>
            </span>
          </Link>
          <p>{settings.storeDescription}</p>
          <div className="footer-social">
            {settings.instagram && (
              <a href={settings.instagram.startsWith('http') ? settings.instagram : `https://${settings.instagram}`} target="_blank" rel="noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
            )}
            {settings.facebook && (
              <a href={settings.facebook.startsWith('http') ? settings.facebook : `https://${settings.facebook}`} target="_blank" rel="noreferrer" aria-label="Facebook">
                <FaFacebookF />
              </a>
            )}
            {settings.youtube && (
              <a href={settings.youtube.startsWith('http') ? settings.youtube : `https://${settings.youtube}`} target="_blank" rel="noreferrer" aria-label="YouTube">
                <FaYoutube />
              </a>
            )}
            {(settings.whatsapp || settings.phone) && (
              <a 
                href={`https://wa.me/${(settings.whatsapp || settings.phone).replace(/\D/g, "")}`} 
                target="_blank" 
                rel="noreferrer" 
                aria-label="WhatsApp"
              >
                <FaWhatsapp />
              </a>
            )}
          </div>
        </div>

        {/* Shop links */}
        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/women">Women's Collection</Link>
          <Link to="/men">Men's Collection</Link>
          <Link to="/kids">Kids' Collection</Link>
          <Link to="/combo">Combo Sets</Link>
          <Link to="/new">New Arrivals</Link>
        </div>

        {/* Company links */}
        <div className="footer-col">
          <h4>Company</h4>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">Shopping Cart</Link>
          <Link to="/login">Login / Register</Link>
        </div>

        {/* Contact */}
        <div className="footer-col footer-contact">
          <h4>Visit the Atelier</h4>
          <p><FaMapMarkerAlt /> {settings.address}</p>
          <p><FaPhoneAlt /> {settings.phone}</p>
          <p><FaEnvelope /> {settings.storeEmail}</p>
          <p><FaClock /> {getBusinessHours()}</p>
        </div>
      </div>

      <div className="trim-divider footer-trim">
        <span className="trim-diamonds">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </div>

      <div className="footer-bottom container">
        <p>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
        <p>Designed &amp; woven with pride in Tamil Nadu.</p>
      </div>
    </footer>
  );
}
