import "./style/Loader.css";

export default function Loader({ label = "Loading" }) {
  return (
    <div className="loader-wrap" role="status" aria-live="polite">
      <div className="loader-motif">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p>{label}…</p>
    </div>
  );
}
