import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="page-enter not-found">
      <div className="container">
        <div className="trim-divider" style={{ maxWidth: 260, margin: "0 auto 26px" }}>
          <span className="trim-diamonds"><span></span><span></span><span></span></span>
        </div>
        <h1>404</h1>
        <p className="eyebrow" style={{ justifyContent: "center" }}>Page Not Found</p>
        <p className="not-found-text">
          The page you're looking for has been moved, renamed, or perhaps
          never existed. Let's get you back to something beautiful.
        </p>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    </div>
  );
}
