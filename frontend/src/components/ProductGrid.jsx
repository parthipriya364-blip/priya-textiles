import ProductCard from "./ProductCard";
import "./style/ProductGrid.css";

export default function ProductGrid({ products, loading, columns = 4, emptyMessage = "No products to show." }) {
  if (loading) {
    return (
      <div className="product-grid" style={{ "--cols": columns }}>
        {Array.from({ length: columns * 2 }).map((_, i) => (
          <div className="product-skeleton" key={i}>
            <div className="skeleton" style={{ aspectRatio: "3/4" }} />
            <div className="skeleton" style={{ height: 14, width: "70%", marginTop: 14 }} />
            <div className="skeleton" style={{ height: 14, width: "40%", marginTop: 8 }} />
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="product-grid" style={{ "--cols": columns }}>
      {products.map((product) => (
        <ProductCard key={product._id || product.id} product={product} />
      ))}
    </div>
  );
}
