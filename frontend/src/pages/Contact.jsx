import { useState } from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaPaperPlane } from "react-icons/fa";
import PageHeader from "../components/PageHeader";
import { useToast } from "../context/ToastContext";
import { isNotEmpty, isValidEmail } from "../utils/validators";
import "./style/Contact.css";

export default function Contact() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!isNotEmpty(form.name)) next.name = "Please enter your name.";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
    if (!isNotEmpty(form.message)) next.message = "Please enter a message.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSent(true);
    showToast("Message sent — we'll get back to you soon!");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="page-enter">
      <PageHeader eyebrow="Get in Touch" title="Contact Us" subtitle="Questions about an order, a custom piece, or bulk family combos? We'd love to hear from you." crumbs={[{ label: "Contact" }]} />

      <section className="section">
        <div className="container contact-grid">
          <div className="contact-info">
            <div className="contact-info-card">
              <FaMapMarkerAlt />
              <div>
                <h4>Visit the Atelier</h4>
                <p>
                  <a
                    href="https://maps.app.goo.gl/iFMqo8wXSDYHQkqw8?g_st=awb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-map-link"
                  >
                    Priya Textiles KVP Theatre Road Opposite Srinivasa Store KVP Suresh Complex Shop No. 4 Elampillai, Salem District Tamil Nadu – 637502, India.
                  </a>
                </p>
              </div>
            </div>
            <div className="contact-info-card">
              <FaPhoneAlt />
              <div>
                <h4>Call Us</h4>
                <p>+91 8807329146</p>
              </div>
            </div>
            <div className="contact-info-card">
              <FaEnvelope />
              <div>
                <h4>Email Us</h4>
                <p>Parthipriya364@gmail.com</p>
              </div>
            </div>
            <div className="contact-info-card">
              <FaClock />
              <div>
                <h4>Store Hours</h4>
                <p>Mon – Sat, 09:00 AM – 10:00 PM</p>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <h3>Send Us a Message</h3>
            {sent && <p className="newsletter-success" style={{ marginBottom: 18 }}>Thanks — your message has been received!</p>}
            <div className="field">
              <label htmlFor="c-name">Your Name</label>
              <input id="c-name" value={form.name} onChange={handleChange("name")} className={errors.name ? "invalid" : ""} />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
            <div className="field">
              <label htmlFor="c-email">Email</label>
              <input id="c-email" type="email" value={form.email} onChange={handleChange("email")} className={errors.email ? "invalid" : ""} />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="field">
              <label htmlFor="c-message">Message</label>
              <textarea id="c-message" rows="5" value={form.message} onChange={handleChange("message")} className={errors.message ? "invalid" : ""} />
              {errors.message && <span className="field-error">{errors.message}</span>}
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              <FaPaperPlane /> Send Message
            </button>
          </form>
        </div>

        {/* Store location — free Google Maps embed, no API key required.
           Replace the `src` query below with your exact store address
           or a Google Maps "Embed a map" share link for pinpoint accuracy. */}
        <div className="container contact-map-wrap">
          <iframe
            className="contact-map"
            title="Priya Textiles Store Location"
            src="https://www.google.com/maps?q=142+Textile+Lane,+R.S.+Puram,+Coimbatore,+Tamil+Nadu+641002&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>
    </div>
  );
}
