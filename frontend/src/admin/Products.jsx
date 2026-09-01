import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash, FaEye, FaStar, FaToggleOn, FaToggleOff, FaSpinner } from "react-icons/fa";
import AdminPageHeader from "./components/AdminPageHeader";
import SearchBar from "./components/SearchBar";
import DataTable from "./components/DataTable";
import Modal from "./components/Modal";
import { useToast } from "../context/ToastContext";
import {
  getProducts,
  deleteProduct,
  toggleProductFeatured,
  toggleProductActive,
} from "../services/productService";
import { getCategories } from "../services/categoryService";
import "./admin-forms.css";
import "./Products.css";

export default function Products() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewProduct, setViewProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productsData.products || []);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      showToast(error.message || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== "all" && p.categoryName !== categoryFilter) return false;
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [products, query, categoryFilter]);

  const handleToggleFeatured = async (id) => {
    try {
      await toggleProductFeatured(id);
      showToast('Featured status updated', 'success');
      loadData();
    } catch (error) {
      showToast(error.message || 'Failed to update featured status', 'error');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleProductActive(id);
      showToast('Active status updated', 'success');
      loadData();
    } catch (error) {
      showToast(error.message || 'Failed to update active status', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setSubmitting(true);
    try {
      await deleteProduct(deleteTarget._id);
      showToast('Product deleted successfully!', 'success');
      setDeleteTarget(null);
      loadData();
    } catch (error) {
      showToast(error.message || 'Failed to delete product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Products"
        subtitle={loading ? 'Loading...' : `${products.length} products in catalogue`}
        action={
          <button
            className="admin-btn admin-btn-gold"
            onClick={() => navigate("/admin/products/add")}
            disabled={loading}
          >
            <FaPlus /> Add Product
          </button>
        }
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <FaSpinner className="fa-spin" size={32} />
          <p style={{ marginTop: '10px' }}>Loading products...</p>
        </div>
      ) : (
        <>
          <div className="admin-toolbar">
            <div className="admin-toolbar-left">
              <SearchBar value={query} onChange={setQuery} placeholder="Search products..." />
              <select
                className="admin-filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <DataTable
            emptyText="No products match your search."
            columns={[
              {
                key: "image",
                label: "Product",
                render: (p) => (
                  <div className="product-cell">
                    <img src={p.image?.url} alt={p.name} />
                    <div>
                      <strong>{p.name}</strong>
                      <span>{p.type || 'N/A'}</span>
                    </div>
                  </div>
                ),
              },
              { 
                key: "category", 
                label: "Category", 
                render: (p) => (
                  <div>
                    <div>{p.categoryName}</div>
                    {p.subCategoryName && <small style={{ color: '#666' }}>{p.subCategoryName}</small>}
                  </div>
                )
              },
              { key: "price", label: "Price", render: (p) => `₹${p.price.toLocaleString("en-IN")}` },
              {
                key: "stock",
                label: "Stock",
                render: (p) => (
                  <span className={`badge ${p.stock === 0 ? "badge-maroon" : p.stock <= 5 ? "badge-gold" : "badge-green"}`}>
                    {p.stock === 0 ? "Out of stock" : `${p.stock} in stock`}
                  </span>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (p) => (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {p.isFeatured && <FaStar size={14} color="var(--c-gold-deep)" title="Featured" />}
                    {p.isNew && <span className="badge badge-green" style={{ fontSize: '10px' }}>NEW</span>}
                    {!p.isActive && <span className="badge badge-maroon" style={{ fontSize: '10px' }}>INACTIVE</span>}
                  </div>
                ),
              },
              {
                key: "actions",
                label: "Actions",
                render: (p) => (
                  <div className="row-actions">
                    <button 
                      className="row-action-btn" 
                      onClick={() => setViewProduct(p)} 
                      aria-label="View"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="row-action-btn"
                      onClick={() => handleToggleFeatured(p._id)}
                      aria-label="Toggle Featured"
                      title={p.isFeatured ? "Unfeature" : "Feature"}
                    >
                      <FaStar color={p.isFeatured ? "var(--c-gold-deep)" : "#ccc"} />
                    </button>
                    <button
                      className="row-action-btn"
                      onClick={() => handleToggleActive(p._id)}
                      aria-label="Toggle Active"
                      title={p.isActive ? "Deactivate" : "Activate"}
                    >
                      {p.isActive ? <FaToggleOn color="var(--c-gold-deep)" size={18} /> : <FaToggleOff size={18} />}
                    </button>
                    <button
                      className="row-action-btn"
                      onClick={() => navigate(`/admin/products/edit/${p._id}`)}
                      aria-label="Edit"
                      title="Edit Product"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="row-action-btn danger"
                      onClick={() => setDeleteTarget(p)}
                      aria-label="Delete"
                      title="Delete Product"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ),
              },
            ]}
            rows={filtered}
          />
        </>
      )}

      {/* View Product Modal */}
      <Modal
        open={!!viewProduct}
        onClose={() => setViewProduct(null)}
        title={viewProduct?.name}
        size="md"
      >
        {viewProduct && (
          <div className="product-view">
            <div className="product-view-images">
              <img src={viewProduct.image?.url} alt={viewProduct.name} style={{ width: '100%', borderRadius: '8px' }} />
              {viewProduct.gallery && viewProduct.gallery.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {viewProduct.gallery.map((img, i) => (
                    <img 
                      key={i} 
                      src={img.url} 
                      alt={`${viewProduct.name} ${i + 1}`} 
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} 
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="product-view-info" style={{ marginTop: '16px' }}>
              <p><b>Category:</b> {viewProduct.categoryName}</p>
              {viewProduct.subCategoryName && <p><b>Subcategory:</b> {viewProduct.subCategoryName}</p>}
              {viewProduct.type && <p><b>Type:</b> {viewProduct.type}</p>}
              {viewProduct.fabric && <p><b>Fabric:</b> {viewProduct.fabric}</p>}
              <p><b>Price:</b> ₹{viewProduct.price.toLocaleString("en-IN")}</p>
              {viewProduct.oldPrice && <p><b>Old Price:</b> ₹{viewProduct.oldPrice.toLocaleString("en-IN")}</p>}
              <p><b>Stock:</b> {viewProduct.stock}</p>
              {viewProduct.colors && viewProduct.colors.length > 0 && (
                <p><b>Colors:</b> {viewProduct.colors.join(', ')}</p>
              )}
              {viewProduct.sizes && viewProduct.sizes.length > 0 && (
                <p><b>Sizes:</b> {viewProduct.sizes.join(', ')}</p>
              )}
              <p><b>Featured:</b> {viewProduct.isFeatured ? 'Yes' : 'No'}</p>
              <p><b>New:</b> {viewProduct.isNew ? 'Yes' : 'No'}</p>
              <p><b>Active:</b> {viewProduct.isActive ? 'Yes' : 'No'}</p>
              <p><b>Description:</b> {viewProduct.description}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Product"
        size="sm"
        footer={
          <>
            <button className="admin-btn admin-btn-outline" onClick={() => setDeleteTarget(null)} disabled={submitting}>
              Cancel
            </button>
            <button className="admin-btn admin-btn-maroon" onClick={confirmDelete} disabled={submitting}>
              {submitting ? <><FaSpinner className="fa-spin" /> Deleting...</> : 'Delete'}
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to delete <b>{deleteTarget?.name}</b>? This will permanently remove the product and all its images from Cloudinary. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
