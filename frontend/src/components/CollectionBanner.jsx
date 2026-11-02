import { Link } from "react-router-dom";
import "./style/CollectionBanner.css";

export default function CollectionBanner({ 
  eyebrow, 
  title, 
  subtitle, 
  crumbs = [],
  backgroundImage,
  useImageBanner = false 
}) {
  if (useImageBanner) {
    return (
      <section className="collection-banner-image">
        {backgroundImage && (
          <div className="collection-banner-bg" style={{ backgroundImage: `url(${backgroundImage})` }} />
        )}
        <div className="collection-banner-content">
          {eyebrow && <span className="collection-eyebrow">{eyebrow}</span>}
          <h1 className="collection-banner-title">{title}</h1>
          {subtitle && <p className="collection-banner-subtitle">{subtitle}</p>}
          
          {crumbs.length > 0 && (
            <nav className="collection-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              {crumbs.map((c, i) => (
                <span key={i}>
                  <span className="sep">/</span>
                  {c.to ? <Link to={c.to}>{c.label}</Link> : <span className="current">{c.label}</span>}
                </span>
              ))}
            </nav>
          )}
        </div>
      </section>
    );
  }

  // Fallback to text-based header
  return (
    <section className="page-header">
      <div className="container">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}

        {crumbs.length > 0 && (
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            {crumbs.map((c, i) => (
              <span key={i}>
                <span className="sep">/</span>
                {c.to ? <Link to={c.to}>{c.label}</Link> : <span className="current">{c.label}</span>}
              </span>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}
