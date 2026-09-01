import { Link } from "react-router-dom";
import "./style/PageHeader.css";

export default function PageHeader({ eyebrow, title, subtitle, crumbs = [] }) {
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
