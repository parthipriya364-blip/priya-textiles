import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import ProductGrid from "../components/ProductGrid";
import WomenSubCategorySlider from "../components/WomenSubCategorySlider";
import { useSubCategories } from "../context/SubCategoryContext";
import { getProducts } from "../services/productService";

const slugify = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function WomenProducts() {
  const { subCategorySlug } = useParams();
  const { activeWomenSubCategories } = useSubCategories();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  const subCategory = useMemo(
    () => activeWomenSubCategories.find((sc) => slugify(sc.name) === subCategorySlug),
    [activeWomenSubCategories, subCategorySlug]
  );

  useEffect(() => {
    if (subCategory) {
      loadProducts();
    }
  }, [subCategorySlug, subCategory]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts({ 
        category: 'women',
        subCategory: subCategory.name 
      });
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (!subCategory) {
    return (
      <div className="page-enter">
        <PageHeader
          eyebrow="Women"
          title="Sub-Category Not Found"
          crumbs={[{ to: "/women", label: "Women" }, { label: "Not Found" }]}
        />
        <WomenSubCategorySlider />
        <section className="section">
          <div className="container empty-state">
            <h3>We couldn't find that collection</h3>
            <p>It may have been renamed or disabled — pick a category above.</p>
            <Link to="/women" className="btn btn-primary">Back to Women</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Women"
        title={subCategory.name}
        crumbs={[{ to: "/women", label: "Women" }, { label: subCategory.name }]}
      />

      <WomenSubCategorySlider activeSlug={subCategorySlug} />

      <section className="section">
        <div className="container">
          <p className="collection-count">
            {loading ? "Loading…" : `${products.length} product${products.length !== 1 ? "s" : ""}`}
          </p>
          <ProductGrid
            products={products}
            loading={loading}
            columns={4}
            emptyMessage={`No products in ${subCategory.name} yet — check back soon.`}
          />
        </div>
      </section>
    </div>
  );
}
