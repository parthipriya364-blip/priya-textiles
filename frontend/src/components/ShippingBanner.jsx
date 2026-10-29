import './ShippingBanner.css';

export default function ShippingBanner() {
  return (
    <section className="shipping-banner">
      <div className="shipping-banner-content">
        <h2 className="banner-title">PRIYA TEXTILES</h2>
        <p className="banner-tagline">Elegant Sarees • Timeless Tradition</p>
        
        <div className="banner-divider"></div>
        
        <div className="shipping-badge">
          <span className="globe-icon">🌍</span>
          <span className="shipping-text">INTERNATIONAL SHIPPING AVAILABLE</span>
        </div>
        
        <p className="banner-subtitle">Shop Your Favourite Sarees From Anywhere</p>
      </div>
    </section>
  );
}
