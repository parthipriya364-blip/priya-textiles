import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import AdminPageHeader from "./components/AdminPageHeader";
import ProductForm from "./components/ProductForm";
import { useToast } from "../context/ToastContext";
import { getProduct, updateProduct } from "../services/productService";
import "./admin-forms.css";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await getProduct(id);
      setProduct(data.product);
    } catch (error) {
      showToast(error.message || 'Failed to load product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await updateProduct(id, formData);
      showToast('Product updated successfully!', 'success');
      navigate("/admin/products");
    } catch (error) {
      showToast(error.message || 'Failed to update product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <AdminPageHeader title="Loading Product..." />
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <FaSpinner className="fa-spin" size={32} />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <AdminPageHeader title="Product Not Found" />
        <div className="admin-form-card">
          <p>The product you're looking for doesn't exist or has been deleted.</p>
          <Link to="/admin/products" className="admin-btn admin-btn-outline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Edit Product"
        subtitle={product.name}
      />
      <div className="admin-form-card">
        <ProductForm
          initialData={product}
          onSubmit={handleSubmit}
          submitLabel={submitting ? "Updating..." : "Update Product"}
          submitting={submitting}
        />
      </div>
    </div>
  );
}
