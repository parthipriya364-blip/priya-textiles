import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTimes, FaTag } from "react-icons/fa";
import { getProducts } from "../services/productService";
import { formatPrice } from "../utils/formatPrice";
import useDebounce from "../hooks/useDebounce";
import "./style/SearchBar.css";

export default function SearchBar({ open, onClose }) {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 250);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    if (!debounced) {
      setResults([]);
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    getProducts({ search: debounced, limit: 8 })
      .then((data) => {
        if (active) {
          setResults((data.products || []).slice(0, 8));
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Search error:', error);
        if (active) {
          setResults([]);
          setLoading(false);
        }
      });

    return () => { active = false; };
  }, [debounced]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      // Prevent body scroll when search is open
      document.body.style.overflow = 'hidden';
    } else {
      setQuery("");
      setResults([]);
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (results[0]) {
      navigate(`/product/${results[0]._id}`);
      onClose();
    } else if (query.trim()) {
      // Navigate to products page with search query
      navigate(`/products?search=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    onClose();
  };

  const handleViewAll = () => {
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="search-overlay" role="dialog" aria-label="Search products">
      <div className="search-panel fade-up">
        <form className="search-box" onSubmit={handleSubmit}>
          <FaSearch className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search sarees, kurtas, lehengas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
          {query && (
            <button 
              type="button" 
              onClick={() => setQuery('')} 
              aria-label="Clear search"
              className="clear-btn"
            >
              <FaTimes />
            </button>
          )}
          <button type="button" onClick={onClose} aria-label="Close search" className="close-btn">
            <FaTimes />
          </button>
        </form>

        {loading && (
          <div className="search-loading">
            <div className="loader-spinner"></div>
            <p>Searching...</p>
          </div>
        )}

        {!loading && debounced && (
          <div className="search-results">
            {results.length === 0 ? (
              <div className="search-empty">
                <FaSearch className="empty-icon" />
                <p>No products found for "<strong>{debounced}</strong>"</p>
                <span>Try different keywords or browse our categories</span>
              </div>
            ) : (
              <>
                <div className="search-results-header">
                  <span>Found {results.length} result{results.length !== 1 ? 's' : ''}</span>
                  {results.length >= 8 && (
                    <button 
                      type="button" 
                      className="view-all-btn"
                      onClick={handleViewAll}
                    >
                      View All
                    </button>
                  )}
                </div>
                <div className="search-results-list">
                  {results.map((p) => (
                    <button
                      key={p._id}
                      className="search-result-item"
                      onClick={() => handleProductClick(p._id)}
                    >
                      <div className="result-image">
                        <img 
                          src={p.image?.url || '/placeholder-product.jpg'} 
                          alt={p.name}
                          onError={(e) => {
                            e.target.src = '/placeholder-product.jpg';
                          }}
                        />
                        {p.isFeatured && (
                          <span className="featured-badge">
                            <FaTag /> Featured
                          </span>
                        )}
                      </div>
                      <div className="result-info">
                        <span className="result-name">{p.name}</span>
                        {p.category && (
                          <span className="result-category">{p.category}</span>
                        )}
                        <div className="result-price-row">
                          <strong className="result-price">{formatPrice(p.price)}</strong>
                          {p.stock > 0 ? (
                            <span className="result-stock in-stock">In Stock</span>
                          ) : (
                            <span className="result-stock out-of-stock">Out of Stock</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {!debounced && !loading && (
          <div className="search-suggestions">
            <p className="suggestions-title">Popular Searches</p>
            <div className="suggestions-list">
              {['Silk Saree', 'Cotton Saree', 'Kurti', 'Lehenga', 'Dupatta', 'Salwar Suit'].map((term) => (
                <button
                  key={term}
                  className="suggestion-chip"
                  onClick={() => setQuery(term)}
                >
                  <FaSearch /> {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="search-backdrop" onClick={onClose} />
    </div>
  );
}
