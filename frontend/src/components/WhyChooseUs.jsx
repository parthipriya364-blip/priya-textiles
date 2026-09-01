import { GiYarn, GiDiamondRing } from "react-icons/gi";
import { FaShippingFast, FaUndoAlt } from "react-icons/fa";
import "./style/WhyChooseUs.css";

const FEATURES = [
  {
    icon: <GiYarn />,
    title: "Handloom Craftsmanship",
    text: "Every weave passes through the hands of master artisans across Tamil Nadu — no two pieces are identical.",
  },
  {
    icon: <GiDiamondRing />,
    title: "Premium Fabrics",
    text: "Pure silk, Chanderi cotton and hand-finished zari — sourced for texture, drape and longevity.",
  },
  {
    icon: <FaShippingFast />,
    title: "Complimentary Shipping",
    text: "Free, insured delivery across India on every order above ₹2,999 — tracked door to door.",
  },
  {
    icon: <FaUndoAlt />,
    title: "Easy 7-Day Returns",
    text: "Not the perfect fit or shade? Return it within 7 days for a full refund, no questions asked.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="section why-choose">
      <div className="why-choose-bg" aria-hidden="true" />
      <div className="container">
        <div className="section-title">
          <span className="eyebrow">Our Promise</span>
          <h2>Why Choose Priya Textiles</h2>
        </div>

        <div className="why-grid">
          {FEATURES.map((f, i) => (
            <div className="why-card" key={f.title} style={{ "--i": i }}>
              <span className="why-index">{String(i + 1).padStart(2, "0")}</span>
              <div className="why-icon-ring">
                <div className="why-icon">{f.icon}</div>
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
              <span className="why-card-glow" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
