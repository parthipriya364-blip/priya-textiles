import { useState, useEffect } from "react";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import { getCategories, getSubCategories } from "../../services/categoryService";
import { useToast } from "../../context/ToastContext";

export default function ProductForm({ initialData, onSubmit, submitLabel = "Save", submitting = false }) {
  const { showToast } = useToast();
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    categoryName: '',
    subCategoryId: '',
    subCategoryName: '',
    type: '',
    price: '',
    oldPrice: '',
    stock: '0',
    fabric: '',
    colors: '',
    sizes: '',
    isNew: false,
    isFeatured: false,
    isBestseller: false,
    tags: '',
    paymentMethods: {
      card: true,
      upi: true,
      cod: true,
    },
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    if (initialData) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        categoryId: initialData.category?._id || initialData.category || '',
        categoryName: initialData.categoryName || '',
        subCategoryId: initialData.subCategory?._id || initialData.subCategory || '',
        subCategoryName: initialData.subCategoryName || '',
        type: initialData.type || '',
        price: initialData.price || '',
        oldPrice: initialData.oldPrice || '',
        stock: initialData.stock || '0',
        fabric: initialData.fabric || '',
        colors: Array.isArray(initialData.colors) ? initialData.colors.join(', ') : '',
        sizes: Array.isArray(initialData.sizes) ? initialData.sizes.join(', ') : '',
        isNew: initialData.isNew || false,
        isFeatured: initialData.isFeatured || false,
        isBestseller: initialData.isBestseller || false,
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
        paymentMethods: initialData.paymentMethods || {
          card: true,
          upi: true,
          cod: true,
        },
      });
      if (initialData.image?.url) {
        setMainImagePreview(initialData.image.url);
      }
      if (initialData.gallery) {
        setGalleryPreviews(initialData.gallery.map(img => img.url));
      }
    }
  }, [initialData]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data.categories || []);
    } catch (error) {
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSubCategories = async (categoryName) => {
    if (categoryName === 'Women') {
      try {
        const data = await getSubCategories('women');
        setSubCategories(data.subcategories || []);
      } catch (error) {
        console.error('Failed to load subcategories:', error);
        setSubCategories([]);
      }
    } else {
      setSubCategories([]);
      setForm(f => ({ ...f, subCategoryId: '', subCategoryName: '' }));
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const category = categories.find(c => c._id === categoryId);
    
    setForm(f => ({
      ...f,
      categoryId,
      categoryName: category?.name || '',
      subCategoryId: '',
      subCategoryName: '',
    }));

    if (category) {
      loadSubCategories(category.name);
    }
  };

  const handleSubCategoryChange = (e) => {
    const subCategoryId = e.target.value;
    const subCategory = subCategories.find(sc => sc._id === subCategoryId);
    
    setForm(f => ({
      ...f,
      subCategoryId,
      subCategoryName: subCategory?.name || '',
    }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
      }
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        showToast('All files must be images', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Each image must be less than 5MB', 'error');
        return;
      }
    }

    if (files.length + galleryImages.length > 5) {
      showToast('Maximum 5 gallery images allowed', 'error');
      return;
    }

    setGalleryImages(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setGalleryPreviews(prev => [...prev, ...previews]);
  };

  const removeGalleryImage = (index) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!form.name || !form.description || !form.categoryId || !form.price) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    if (!initialData && !mainImage) {
      showToast('Please upload a product image', 'error');
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('categoryId', form.categoryId);
    formData.append('categoryName', form.categoryName);
    if (form.subCategoryId) {
      formData.append('subCategoryId', form.subCategoryId);
      formData.append('subCategoryName', form.subCategoryName);
    }
    if (form.type) formData.append('type', form.type);
    formData.append('price', form.price);
    if (form.oldPrice) formData.append('oldPrice', form.oldPrice);
    formData.append('stock', form.stock);
    if (form.fabric) formData.append('fabric', form.fabric);
    if (form.colors) formData.append('colors', form.colors);
    if (form.sizes) formData.append('sizes', form.sizes);
    formData.append('isNew', form.isNew);
    formData.append('isFeatured', form.isFeatured);
    formData.append('isBestseller', form.isBestseller);
    if (form.tags) formData.append('tags', form.tags);

    // Add payment methods
    formData.append('paymentMethods', JSON.stringify(form.paymentMethods));

    // Add main image
    if (mainImage) {
      formData.append('image', mainImage);
    }

    // Add gallery images
    galleryImages.forEach((file) => {
      formData.append('gallery', file);
    });

    onSubmit(formData);
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="admin-form-group">
          <label>Product Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g., Kanjivaram Silk Saree"
            required
          />
        </div>
      </div>

      <div className="admin-form-group">
        <label>Description *</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
          rows="4"
          placeholder="Detailed product description"
          required
        />
      </div>

      <div className="form-row">
        <div className="admin-form-group">
          <label>Category *</label>
          <select
            value={form.categoryId}
            onChange={handleCategoryChange}
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {form.categoryName === 'Women' && subCategories.length > 0 && (
          <div className="admin-form-group">
            <label>Subcategory</label>
            <select
              value={form.subCategoryId}
              onChange={handleSubCategoryChange}
            >
              <option value="">Select Subcategory (Optional)</option>
              {subCategories.map((sc) => (
                <option key={sc._id} value={sc._id}>{sc.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="form-row">
        <div className="admin-form-group">
          <label>Product Type</label>
          <input
            type="text"
            value={form.type}
            onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
            placeholder="e.g., Saree, Kurta, Shirt"
          />
        </div>

        <div className="admin-form-group">
          <label>Fabric</label>
          <input
            type="text"
            value={form.fabric}
            onChange={(e) => setForm(f => ({ ...f, fabric: e.target.value }))}
            placeholder="e.g., Silk, Cotton, Linen"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="admin-form-group">
          <label>Price (₹) *</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
            min="0"
            step="1"
            required
          />
        </div>

        <div className="admin-form-group">
          <label>Old Price (₹)</label>
          <input
            type="number"
            value={form.oldPrice}
            onChange={(e) => setForm(f => ({ ...f, oldPrice: e.target.value }))}
            min="0"
            step="1"
          />
          <small style={{ color: '#666' }}>Leave empty if no discount</small>
        </div>

        <div className="admin-form-group">
          <label>Stock Quantity</label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))}
            min="0"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="admin-form-group">
          <label>Colors</label>
          <input
            type="text"
            value={form.colors}
            onChange={(e) => setForm(f => ({ ...f, colors: e.target.value }))}
            placeholder="e.g., Red, Blue, Green (comma separated)"
          />
        </div>

        <div className="admin-form-group">
          <label>Sizes</label>
          <input
            type="text"
            value={form.sizes}
            onChange={(e) => setForm(f => ({ ...f, sizes: e.target.value }))}
            placeholder="e.g., S, M, L, XL (comma separated)"
          />
        </div>
      </div>

      <div className="admin-form-group">
        <label>Tags</label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
          placeholder="e.g., traditional, festive, wedding (comma separated)"
        />
      </div>

      <div className="form-row">
        <div className="admin-form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.isNew}
              onChange={(e) => setForm(f => ({ ...f, isNew: e.target.checked }))}
            />
            Mark as New Arrival
          </label>
        </div>

        <div className="admin-form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm(f => ({ ...f, isFeatured: e.target.checked }))}
            />
            Mark as Featured
          </label>
        </div>

        <div className="admin-form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.isBestseller}
              onChange={(e) => setForm(f => ({ ...f, isBestseller: e.target.checked }))}
            />
            Mark as Bestseller
          </label>
        </div>
      </div>

      <div className="admin-form-group">
        <label>Accepted Payment Methods *</label>
        <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
          <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={form.paymentMethods.card}
              onChange={(e) => setForm(f => ({ 
                ...f, 
                paymentMethods: { ...f.paymentMethods, card: e.target.checked }
              }))}
            />
            <span style={{ marginLeft: '6px' }}>Card / Debit Card</span>
          </label>

          <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={form.paymentMethods.upi}
              onChange={(e) => setForm(f => ({ 
                ...f, 
                paymentMethods: { ...f.paymentMethods, upi: e.target.checked }
              }))}
            />
            <span style={{ marginLeft: '6px' }}>UPI</span>
          </label>

          <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={form.paymentMethods.cod}
              onChange={(e) => setForm(f => ({ 
                ...f, 
                paymentMethods: { ...f.paymentMethods, cod: e.target.checked }
              }))}
            />
            <span style={{ marginLeft: '6px' }}>Cash on Delivery (COD)</span>
          </label>
        </div>
        <small style={{ color: '#666', display: 'block', marginTop: '6px' }}>
          Select at least one payment method that customers can use for this product
        </small>
      </div>

      <div className="admin-form-group">
        <label>Main Product Image {!initialData && '*'}</label>
        <label className="image-upload-box">
          <FaCloudUploadAlt size={20} style={{ marginBottom: 6 }} />
          <br />
          Click to upload main image
          <input type="file" accept="image/*" hidden onChange={handleMainImageChange} />
        </label>
        {mainImagePreview && (
          <div className="image-preview-strip">
            <img src={mainImagePreview} alt="Main product" />
          </div>
        )}
        <small style={{ color: '#666' }}>Max size: 5MB. This will be the primary product image.</small>
      </div>

      <div className="admin-form-group">
        <label>Gallery Images (Optional)</label>
        <label className="image-upload-box">
          <FaCloudUploadAlt size={20} style={{ marginBottom: 6 }} />
          <br />
          Click to upload gallery images
          <input type="file" accept="image/*" multiple hidden onChange={handleGalleryChange} />
        </label>
        {galleryPreviews.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
            {galleryPreviews.map((preview, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img 
                  src={preview} 
                  alt={`Gallery ${i + 1}`} 
                  style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} 
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(i)}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <FaTimes size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <small style={{ color: '#666' }}>Max 5 images, 5MB each. Additional product photos.</small>
      </div>

      <div className="row-actions" style={{ gap: 12, marginTop: 20 }}>
        <button type="submit" className="admin-btn admin-btn-gold" disabled={submitting}>
          {submitLabel}
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-outline"
          onClick={() => window.history.back()}
          disabled={submitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
