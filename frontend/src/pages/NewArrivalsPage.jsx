import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import ProductGrid from "../components/ProductGrid";
import { getProducts } from "../services/productService";

export default function NewArrivalsPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadNewArrivals();
  }, []);

  const loadNewArrivals = async () => {
    setLoading(true);
    try {
      const data = await getProducts({ isNew: 'true' });
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load new arrivals:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Just Woven"
        title="New Arrivals"
        subtitle="The newest pieces to enter the atelier — limited runs, fresh off the loom this season."
        crumbs={[{ label: "New Arrivals" }]}
      />
      <section className="section">
        <div className="container">
          <ProductGrid 
            products={products} 
            loading={loading} 
            columns={4} 
            emptyMessage="No new arrivals right now — check back soon." 
          />
        </div>
      </section>
    </div>
  );
}
