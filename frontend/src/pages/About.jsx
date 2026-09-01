import { Link } from "react-router-dom";
import { GiYarn, GiFlowerPot, GiWorld } from "react-icons/gi";
import { FaArrowRight } from "react-icons/fa";
import PageHeader from "../components/PageHeader";


import "./style/About.css";

const VALUES = [
  { icon: <GiYarn />, title: "Heritage Craft", text: "Every saree and kurta is woven by artisan families whose techniques have been passed down for generations." },
  { icon: <GiFlowerPot />, title: "Sustainable Sourcing", text: "We work directly with handloom clusters across Tamil Nadu, ensuring fair wages and traceable fabric." },
  { icon: <GiWorld />, title: "Modern Reach", text: "From Coimbatore to your doorstep anywhere in India — heritage fashion made accessible." },
];

export default function About() {
  return (
    <div className="page-enter">
      <PageHeader eyebrow="Our Story" title="About Priya Textiles" crumbs={[{ label: "About Us" }]} />

      <section className="section about-intro">
        <div className="container about-intro-grid">
          <img src={banner} alt="Priya Textiles atelier" className="about-img" />
          <div>
            <span className="eyebrow">Since Our First Loom</span>
            <h2>Woven With Purpose, Worn With Pride</h2>
            <p>
             Priya Textiles is a trusted textile store offering a wide range of premium sarees and traditional ethnic wear for every occasion. With both a physical store and an online shopping experience, we are committed to bringing quality, elegance, and value to our customers.

Our collection includes Silk Sarees, Cotton Sarees, Designer Sarees, Wedding Collections, Party Wear, and festive outfits, carefully selected to meet the needs of every customer. We focus on premium quality, affordable pricing, and excellent customer service.
            </p>
            <p>
              At Priya Textiles, we believe every outfit should reflect confidence, tradition, and style. Whether you visit our store or shop online, our goal is to provide a seamless shopping experience with secure payments, fast delivery, and reliable support.

We are grateful for the trust of our customers and continue to bring the latest collections while maintaining the quality and service that define Priya Textiles.
            </p>
            <Link to="/women" className="btn btn-primary">
              Explore Our Collections <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--cream about-values">
        <div className="container">
          <div className="section-title">
            <span className="eyebrow">What We Stand For</span>
            <h2>Our Values</h2>
          </div>
          <div className="why-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {VALUES.map((v) => (
              <div className="why-card" key={v.title}>
                <div className="why-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section about-cta">
        <div className="container about-cta-inner">
          <img src={women} alt="" className="about-cta-img" />
          <div className="about-cta-content">
            <span className="eyebrow eyebrow-light">Visit Us</span>
            <h2>Experience the Craft in Person</h2>
            <p>Step into our Coimbatore atelier to feel the fabric, meet our artisans, and get a custom fitting for your next celebration.</p>
            <Link to="/contact" className="btn btn-gold">Get Directions</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
