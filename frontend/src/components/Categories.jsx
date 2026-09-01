import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaSpinner } from "react-icons/fa";
import { getCategories } from "../services/categoryService";
import "./style/Categories.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      // Sort by order field
      const sorted = (data.categories || []).sort((a, b) => a.order - b.order);
      setCategories(sorted);
      setError(null);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="section categories">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FaSpinner className="fa-spin" size={32} style={{ color: 'var(--c-gold-deep)' }} />
            <p style={{ marginTop: '16px', color: 'var(--c-gray)' }}>Loading categories...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section categories">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: 'var(--c-maroon-deep)' }}>{error}</p>
            <button 
              onClick={loadCategories} 
              style={{ 
                marginTop: '16px', 
                padding: '10px 24px', 
                background: 'var(--c-gold-deep)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="section categories">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: 'var(--c-gray)' }}>No categories available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section categories">
      <div className="container">
        <div className="section-title">
          <span className="eyebrow">Shop by Category</span>
          <h2>Our Collections</h2>
          <p>Four collections, one philosophy — heirloom craftsmanship made wearable for everyday celebration.</p>
        </div>

        <div className="category-grid">
          {categories.map((cat, i) => (
            <Link 
              to={`/${cat.slug}`} 
              key={cat._id} 
              className={`category-card card-${i + 1}`}
            >
              <img src={cat.image?.url} alt={cat.name} />
              <div className="category-card-overlay">
                <span className="collection-tag">Premium Collection</span>
                <h3>{cat.name}'s Collection</h3>
                <p>{cat.description || `Explore our ${cat.name.toLowerCase()} collection`}</p>
                <span className="explore-link">
                  Explore <FaArrowRight />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
