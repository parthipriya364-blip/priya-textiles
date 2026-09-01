import { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { isValidEmail } from "../utils/validators";
import { useToast } from "../context/ToastContext";
import "./style/Newsletter.css";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubmitted(true);
    showToast("You're on the list — welcome to Priya Textiles!");
    setEmail("");
  };

  return (
    <section className="section newsletter">
      <div className="container newsletter-inner">
        <div className="trim-divider">
          <span className="trim-diamonds"><span></span><span></span><span></span></span>
        </div>
        <span className="eyebrow">Stay in the Loop</span>
        <h2>Join Our Newsletter</h2>
        <p>Be the first to know about new collections, festive drops and private sale previews.</p>

        {submitted ? (
          <p className="newsletter-success">Thank you for subscribing! Watch your inbox for our next drop.</p>
        ) : (
          <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
              className={error ? "invalid" : ""}
            />
            <button type="submit" className="btn btn-primary">
              Subscribe <FaPaperPlane />
            </button>
          </form>
        )}
        {error && <p className="field-error">{error}</p>}
      </div>
    </section>
  );
}
