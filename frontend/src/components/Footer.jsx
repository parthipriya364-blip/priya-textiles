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

  const storeWords = (settings.storeName || "Priya Textiles").split(" ");
  const storePrimary = storeWords[0] || "Priya";
  const storeSecondary = storeWords.slice(1).join(" ") || "TEXTILES";

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        {/* Brand */}
        <div className="footer-brand">
          <Link to="/" className="brand">
            <img
              src={settings.logo || logoFallback}
              alt={settings.storeName || "Priya Textiles"}
              onError={(e) => { e.currentTarget.src = logoFallback; }}
            />
            <span className="brand-text">
              <span className="brand-primary-wrap">
                <strong>{storePrimary}</strong>
                {/* Exact Golden Leaf & Wave SVG from your image */}
                <svg
                  className="brand-gold-flourish"
                  viewBox="0 0 110 65"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="goldLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFF3A6" />
                      <stop offset="45%" stopColor="#E6A522" />
                      <stop offset="100%" stopColor="#8E5405" />
                    </linearGradient>
                    <linearGradient id="goldWaveGrad" x1="0%" y1="20%" x2="100%" y2="80%">
                      <stop offset="0%" stopColor="#B87609" />
                      <stop offset="50%" stopColor="#FAD665" />
                      <stop offset="100%" stopColor="#A66506" />
                    </linearGradient>
                  </defs>
                  {/* Left tall leaf */}
                  <path
                    d="M12 50 C10 34, 24 18, 12 4 C28 16, 26 36, 12 50 Z"
                    fill="url(#goldLeafGrad)"
                  />
                  <path
                    d="M14 45 C18 32, 20 22, 15 10"
                    stroke="#5C3402"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  {/* Small middle leaf */}
                  <path
                    d="M27 35 C26 25, 34 18, 39 14 C40 24, 34 32, 27 35 Z"
                    fill="url(#goldLeafGrad)"
                  />
                  <path
                    d="M28 33 C31 27, 34 22, 37 17"
                    stroke="#5C3402"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                  {/* Golden dot */}
                  <circle cx="26" cy="41" r="3.2" fill="url(#goldLeafGrad)" />
                  {/* Bottom sweeping wave */}
                  <path
                    d="M8 55 C30 56, 48 28, 82 34 C94 36, 102 44, 106 54 C94 45, 76 42, 54 50 C36 56, 22 60, 8 55 Z"
                    fill="url(#goldWaveGrad)"
                  />
                  <path
                    d="M14 55 C36 52, 56 35, 84 38 C93 39, 99 43, 104 50"
                    stroke="#FFF5B8"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
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
          <p><FaMapMarkerAlt /> Priya Textiles KVP Theatre Road Opposite Srinivasa Store KVP Suresh Complex Shop No. 4 Elampillai, Salem District Tamil Nadu  637502, India.</p>
          <p><FaPhoneAlt />8220779146,<br />
                           8807329146</p>
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
        <p>Designed & woven with pride in Tamil Nadu.</p>
      </div>
    </footer>
  );
}