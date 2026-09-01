import { Link } from "react-router-dom";
import "./style/WomenSubCategoryCard.css";

const slugify = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function WomenSubCategoryCard({ subCategory, active = false }) {
  return (
    <Link
      to={`/women/${slugify(subCategory.name)}`}
      className={`wsc-card ${active ? "active" : ""}`}
    >
      <div className="wsc-image-wrap">
        {subCategory.image ? (
          <img src={subCategory.image} alt={subCategory.name} />
        ) : (
          <div className="wsc-fallback" aria-hidden="true">
            {subCategory.name.charAt(0)}
          </div>
        )}
        <span className="wsc-shine" aria-hidden="true" />
      </div>
      <span className="wsc-name">{subCategory.name}</span>
    </Link>
  );
}

export { slugify };
