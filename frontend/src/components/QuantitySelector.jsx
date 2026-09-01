import { FaMinus, FaPlus } from "react-icons/fa";

export default function QuantitySelector({ qty, onChange, min = 1, max = 10 }) {
  return (
    <div className="qty-selector">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, qty - 1))}
        disabled={qty <= min}
      >
        <FaMinus />
      </button>
      <span aria-live="polite">{qty}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, qty + 1))}
        disabled={qty >= max}
      >
        <FaPlus />
      </button>
    </div>
  );
}
