import { useEffect, useState } from "react";
import CollectionBanner from "../components/CollectionBanner";
import ProductGrid from "../components/ProductGrid";
import { getProducts } from "../services/productService";
import Seo, { buildBreadcrumbJsonLd } from "../components/Seo";

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
      <Seo
        title="New Arrivals | Latest Ethnic Wear"
        description="Shop the latest sarees, ethnic wear and seasonal fashion newly added to PRIYA TEXTILES."
        path="/new"
        jsonLd={buildBreadcrumbJsonLd([
          { name: "PRIYA TEXTILES", path: "/" },
          { name: "New Arrivals", path: "/new" },
        ])}
      />
      <CollectionBanner
        eyebrow="EXPLORE OUR COLLECTION"
        title="New Arrivals"
        subtitle="Discover the latest additions to our collection — beautifully crafted sarees, elegant kurtis, and timeless ethnic wear at PRIYA TEXTILES."
        crumbs={[{ label: "New Arrivals" }]}
        useImageBanner={true}
        backgroundImage="https://images.unsplash.com/photo-1583391733981-e8536f5c3031?w=1200"
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
