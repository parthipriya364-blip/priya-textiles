import { useEffect, useState } from "react";
import { FaTimes, FaMobileAlt, FaShieldAlt, FaCheckCircle } from "react-icons/fa";
import { formatPrice } from "../../utils/formatPrice";
import { verifyDemoPaymentStub } from "../../services/razorpayService";
import "./RazorpayCheckoutDemo.css";

/**
 * RazorpayCheckoutDemo
 * ------------------------------------------------------------------
 * FRONTEND-ONLY demo of a Razorpay-style checkout modal.
 * - Shows ONLY UPI as a payment method (no card / net banking / wallet).
 * - Never claims a real charge occurred; never fabricates a payment
 *   record. It simply simulates the UI flow so a real Razorpay
 *   Checkout (via window.Razorpay, wired through a backend order +
 *   signature-verification API — see src/services/razorpayService.js)
 *   can be dropped in later without reshaping this component's props.
 *
 * Props:
 *   amount        — number, the order total to display/charge (demo)
 *   merchantName  — string, shown in the modal header
 *   onClose()     — called when the user dismisses the modal
 *   onDemoSuccess() — called once the simulated UPI payment "completes"
 * ------------------------------------------------------------------
 */
export default function RazorpayCheckoutDemo({ amount, merchantName = "Priya Textiles", onClose, onDemoSuccess }) {
  const [upiId, setUpiId] = useState("");
  const [touched, setTouched] = useState(false);
  const [stage, setStage] = useState("form"); // form | processing | success

  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && stage !== "processing" && onClose?.();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [stage, onClose]);

  const isValidUpi = /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim());

  const handlePay = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!isValidUpi) return;

    setStage("processing");
    // NOTE: this only simulates a network/gateway round-trip.
    // No request is sent anywhere and no money moves.
    verifyDemoPaymentStub().then(() => {
      setStage("success");
      setTimeout(() => {
        onDemoSuccess?.({ method: "upi", upiId: upiId.trim(), isRealPayment: false });
      }, 1000);
    });
  };

  return (
    <div className="rzp-demo-overlay" role="dialog" aria-modal="true" aria-label="UPI payment demo">
      <div className="rzp-demo-modal">
        <button
          type="button"
          className="rzp-demo-close"
          onClick={onClose}
          aria-label="Close payment dialog"
          disabled={stage === "processing"}
        >
          <FaTimes />
        </button>

        <div className="rzp-demo-header">
          <div className="rzp-demo-brand">{merchantName}</div>
          <div className="rzp-demo-amount">{formatPrice(amount)}</div>
          <div className="rzp-demo-badge">Frontend Demo Only · No Real Gateway Connected</div>
        </div>

        {stage !== "success" && (
          <div className="rzp-demo-method">
            <FaMobileAlt />
            <span>UPI</span>
          </div>
        )}

        {stage === "form" && (
          <form className="rzp-demo-form" onSubmit={handlePay} noValidate>
            <label htmlFor="rzp-upi-id">Enter UPI ID</label>
            <input
              id="rzp-upi-id"
              placeholder="yourname@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className={touched && !isValidUpi ? "invalid" : ""}
              autoFocus
            />
            {touched && !isValidUpi && <span className="rzp-demo-error">Enter a valid UPI ID, e.g. name@bank</span>}

            <button type="submit" className="rzp-demo-pay-btn">
              Pay {formatPrice(amount)}
            </button>

            <p className="rzp-demo-disclaimer">
              <FaShieldAlt /> This is a UI simulation for demonstration purposes. No payment is processed, no
              amount is charged, and no transaction record is created.
            </p>
          </form>
        )}

        {stage === "processing" && (
          <div className="rzp-demo-processing">
            <span className="rzp-demo-spinner" />
            <p>Simulating UPI payment…</p>
          </div>
        )}

        {stage === "success" && (
          <div className="rzp-demo-success">
            <FaCheckCircle className="rzp-demo-success-icon" />
            <h4>Demo Payment Simulated</h4>
            <p>
              This UPI payment flow was simulated for demo purposes only — no real transaction occurred and no
              charge was made.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
