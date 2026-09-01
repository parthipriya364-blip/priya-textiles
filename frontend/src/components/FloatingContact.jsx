import { FaWhatsapp, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import "./style/FloatingContact.css";

/**
 * FloatingContact
 * ------------------------------------------------------------------
 * Reusable, global floating contact bar (WhatsApp / Call / Email / Location).
 * Mounted once, above the router's route content, so it persists
 * across every page and route without re-mounting on navigation.
 *
 * This is the ONLY floating contact bar in the app — do not add
 * another instance elsewhere.
 *
 * Update the constants below with real business details.
 * ------------------------------------------------------------------
 */
const WHATSAPP_NUMBER = "918220779146"; // country code + number, no symbols
const PHONE_NUMBER = "+918807329146"; // include country code and + sign
const EMAIL_ADDRESS = "Parthipriya364@gmail.com";

// Placeholder — replace with the exact Google Maps link/place for the shop.
const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/iFMqo8wXSDYHQkqw8?g_st=awb";

const WHATSAPP_MESSAGE = "Hi Priya Textiles, I have a question about your collection.";

const CONTACT_LINKS = [
  {
    key: "whatsapp",
    label: "Chat on WhatsApp",
    ariaLabel: "WhatsApp",
    href: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`,
    icon: <FaWhatsapp />,
    className: "fc-whatsapp",
    external: true,
  },
  {
    key: "call",
    label: "Call Us",
    ariaLabel: "Phone Call",
    href: `tel:${PHONE_NUMBER}`,
    icon: <FaPhoneAlt />,
    className: "fc-call",
    external: false,
  },
  {
    key: "email",
    label: "Email Us",
    ariaLabel: "Email",
    href: `mailto:${EMAIL_ADDRESS}`,
    icon: <FaEnvelope />,
    className: "fc-email",
    external: false,
  },
  {
    key: "location",
    label: "Find Us on Maps",
    ariaLabel: "Location",
    href: GOOGLE_MAPS_URL,
    icon: <FaMapMarkerAlt />,
    className: "fc-location",
    external: true,
  },
];

export default function FloatingContact() {
  return (
    <nav className="floating-contact" aria-label="Quick contact">
      {CONTACT_LINKS.map((item) => (
        <a
          key={item.key}
          href={item.href}
          className={`floating-contact-btn ${item.className}`}
          aria-label={item.ariaLabel}
          title={item.label}
          {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          <span className="floating-contact-pulse" aria-hidden="true" />
          <span className="floating-contact-icon">{item.icon}</span>
          <span className="floating-contact-tooltip">{item.label}</span>
        </a>
      ))}
    </nav>
  );
}

