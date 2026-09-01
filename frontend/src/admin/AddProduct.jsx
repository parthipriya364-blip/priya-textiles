import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminPageHeader from "./components/AdminPageHeader";
import ProductForm from "./components/ProductForm";
import { useToast } from "../context/ToastContext";
import { createProduct } from "../services/productService";
import "./admin-forms.css";

export default function AddProduct() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await createProduct(formData);
      showToast('Product created successfully!', 'success');
      navigate("/admin/products");
    } catch (error) {
      showToast(error.message || 'Failed to create product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Add Product"
        subtitle="Add a new product to the catalogue"
      />
      <div className="admin-form-card">
        <ProductForm 
          onSubmit={handleSubmit} 
          submitLabel={submitting ? "Creating..." : "Create Product"}
          submitting={submitting}
        />
      </div>
    </div>
  );
}
