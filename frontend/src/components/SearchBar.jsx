import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import { getProducts } from "../services/productService";
import { formatPrice } from "../utils/formatPrice";
import useDebounce from "../hooks/useDebounce";
import "./style/SearchBar.css";

export default function SearchBar({ open, onClose }) {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 250);
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    if (!debounced) {
      setResults([]);
      return () => { active = false; };
    }

    getProducts({ search: debounced })
      .then((data) => {
        if (active) setResults((data.products || []).slice(0, 6));
      })
      .catch(() => {
        if (active) setResults([]);
      });

    return () => { active = false; };
  }, [debounced]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    else setQuery("");
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (results[0]) {
      navigate(`/product/${results[0]._id}`);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="search-overlay" role="dialog" aria-label="Search products">
      <div className="search-panel fade-up">
        <form className="search-box" onSubmit={handleSubmit}>
          <FaSearch />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search sarees, kurtas, lehengas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" onClick={onClose} aria-label="Close search">
            <FaTimes />
          </button>
        </form>

        {debounced && (
          <div className="search-results">
            {results.length === 0 ? (
              <p className="search-empty">No products found for “{debounced}”.</p>
            ) : (
              results.map((p) => (
                <button
                  key={p._id}
                  className="search-result-item"
                  onClick={() => {
                    navigate(`/product/${p._id}`);
                    onClose();
                  }}
                >
                  <img src={p.image?.url} alt={p.name} />
                  <div>
                    <span>{p.name}</span>
                    <strong>{formatPrice(p.price)}</strong>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      <div className="search-backdrop" onClick={onClose} />
    </div>
  );
}
