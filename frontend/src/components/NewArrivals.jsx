import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { getProducts } from "../services/productService";
import ProductGrid from "./ProductGrid";
import "./style/NewArrivals.css";

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNewArrivals();
  }, []);

  const loadNewArrivals = async () => {
    try {
      setLoading(true);
      const data = await getProducts({ isNew: 'true' });
      setProducts((data.products || []).slice(0, 4));
    } catch (error) {
      console.error('Failed to load new arrivals:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Don't show section if no new products
  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="section new-arrivals">
      <div className="container">
        <div className="new-arrivals-head">
          <div className="section-title align-left">
            <span className="eyebrow">Fresh off the loom</span>
            <h2>New Arrivals</h2>
            <p>The latest additions to the atelier — limited runs, woven this season.</p>
          </div>
          <Link to="/new" className="btn btn-outline-dark">
            View All <FaArrowRight />
          </Link>
        </div>

        <ProductGrid products={products} loading={loading} columns={4} />
      </div>
    </section>
  );
}
