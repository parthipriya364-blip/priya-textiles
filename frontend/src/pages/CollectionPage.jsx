import { useEffect, useMemo, useState } from "react";
import { FaFilter, FaSpinner } from "react-icons/fa";
import PageHeader from "../components/PageHeader";
import ProductGrid from "../components/ProductGrid";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import "./style/CollectionPage.css";

const SORTS = {
  featured: (a, b) => Number(b.isFeatured) - Number(a.isFeatured),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
  newest: (a, b) => Number(b.isNew) - Number(a.isNew),
};

export default function CollectionPage({ category, belowHeader }) {
  const [categoryData, setCategoryData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("featured");
  const [type, setType] = useState("all");
  const [maxPrice, setMaxPrice] = useState(20000);

  useEffect(() => {
    loadData();
  }, [category]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriesData, productsData] = await Promise.all([
        getCategories(),
        getProducts({ category })
      ]);
      
      const foundCategory = categoriesData.categories?.find(c => c.slug === category);
      setCategoryData(foundCategory || {
        name: category.charAt(0).toUpperCase() + category.slice(1),
        description: `Explore our ${category} collection`,
        slug: category
      });

      setProducts(productsData.products || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setCategoryData({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        description: `Explore our ${category} collection`,
        slug: category
      });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const types = useMemo(() => {
    const uniqueTypes = [...new Set(products.map((p) => p.type).filter(Boolean))];
    return ["all", ...uniqueTypes];
  }, [products]);

  const filtered = useMemo(() => {
    return products
      .filter((p) => (type === "all" ? true : p.type === type))
      .filter((p) => p.price <= maxPrice)
      .sort(SORTS[sort]);
  }, [products, type, maxPrice, sort]);

  if (!categoryData) {
    return (
      <div className="page-enter" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FaSpinner className="fa-spin" size={32} style={{ color: 'var(--c-gold-deep)' }} />
      </div>
    );
  }

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Collection"
        title={`${categoryData.name}'s Collection`}
        subtitle={categoryData.description || `Explore our ${categoryData.name.toLowerCase()} collection`}
        crumbs={[{ label: `${categoryData.name}'s Collection` }]}
      />

      {belowHeader}

      <section className="section collection-page">
        <div className="container">
          <div className="collection-toolbar">
            <div className="collection-filters">
              <span className="collection-filter-label"><FaFilter /> Filter</span>
              {types.length > 1 && (
                <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type">
                  {types.map((t) => (
                    <option key={t} value={t}>{t === "all" ? "All Types" : t}</option>
                  ))}
                </select>
              )}

              <label className="price-filter">
                Up to {"\u20B9"}{maxPrice.toLocaleString("en-IN")}
                <input
                  type="range"
                  min="1000"
                  max="20000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
              </label>
            </div>

            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products" className="collection-sort">
              <option value="featured">Sort: Featured</option>
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Sort: Top Rated</option>
            </select>
          </div>

          <p className="collection-count">
            {loading ? "Loading products..." : `${filtered.length} product${filtered.length !== 1 ? "s" : ""}`}
          </p>

          <ProductGrid
            products={filtered}
            loading={loading}
            columns={4}
            emptyMessage="No products available in this category yet. Check back soon!"
          />
        </div>
      </section>
    </div>
  );
}
