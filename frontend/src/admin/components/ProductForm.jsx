import { useState, useEffect } from "react";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import { getCategories, getSubCategories } from "../../services/categoryService";
import { useToast } from "../../context/ToastContext";

// Function to extract dominant colors from an image
const extractColorsFromImage = (imageFile) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize image for faster processing
        const maxSize = 100;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        const colorMap = {};
        
        // Sample pixels and count color frequencies
        for (let i = 0; i < pixels.length; i += 4 * 4) { // Sample every 4th pixel
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];
          
          // Skip transparent or very light/dark pixels
          if (a < 125 || (r > 240 && g > 240 && b > 240) || (r < 20 && g < 20 && b < 20)) {
            continue;
          }
          
          // Quantize colors to reduce variations
          const qr = Math.round(r / 51) * 51;
          const qg = Math.round(g / 51) * 51;
          const qb = Math.round(b / 51) * 51;
          const colorKey = `${qr},${qg},${qb}`;
          
          colorMap[colorKey] = (colorMap[colorKey] || 0) + 1;
        }
        
        // Sort by frequency and get top colors
        const sortedColors = Object.entries(colorMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([color]) => {
            const [r, g, b] = color.split(',').map(Number);
            return {
              rgb: `rgb(${r}, ${g}, ${b})`,
              hex: `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`,
              name: getColorName(r, g, b)
            };
          });
        
        resolve(sortedColors);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(imageFile);
  });
};

// Function to get a human-readable color name
const getColorName = (r, g, b) => {
  const colors = [
    { name: 'Red', rgb: [255, 0, 0] },
    { name: 'Pink', rgb: [255, 192, 203] },
    { name: 'Orange', rgb: [255, 165, 0] },
    { name: 'Yellow', rgb: [255, 255, 0] },
    { name: 'Green', rgb: [0, 128, 0] },
    { name: 'Blue', rgb: [0, 0, 255] },
    { name: 'Purple', rgb: [128, 0, 128] },
    { name: 'Brown', rgb: [139, 69, 19] },
    { name: 'Black', rgb: [0, 0, 0] },
    { name: 'White', rgb: [255, 255, 255] },
    { name: 'Gray', rgb: [128, 128, 128] },
    { name: 'Beige', rgb: [245, 245, 220] },
    { name: 'Gold', rgb: [255, 215, 0] },
    { name: 'Silver', rgb: [192, 192, 192] },
    { name: 'Maroon', rgb: [128, 0, 0] },
    { name: 'Navy', rgb: [0, 0, 128] },
    { name: 'Teal', rgb: [0, 128, 128] },
    { name: 'Olive', rgb: [128, 128, 0] },
  ];
  
  let minDistance = Infinity;
  let closestColor = 'Unknown';
  
  colors.forEach(({ name, rgb: [cr, cg, cb] }) => {
    const distance = Math.sqrt(
      Math.pow(r - cr, 2) + Math.pow(g - cg, 2) + Math.pow(b - cb, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = name;
    }
  });
  
  return closestColor;
};

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
    colors: [],
    sizes: [],
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

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'];
  const [extractedColors, setExtractedColors] = useState([]);
  const [extractingColors, setExtractingColors] = useState(false);
  
  // Predefined product types and fabrics
  const defaultProductTypes = [
    'Saree',
    'Kurta',
    'Shirt',
    'Pants',
    'Dress',
    'Blouse',
    'Lehenga',
    'Dupatta',
    'Churidar',
    'Salwar',
    'Kurti'
  ];
  
  const defaultFabrics = [
    'Silk',
    'Cotton',
    'Linen',
    'Polyester',
    'Chiffon',
    'Georgette',
    'Velvet',
    'Wool',
    'Rayon',
    'Satin',
    'Crepe',
    'Net',
    'Brocade'
  ];

  const [productTypes, setProductTypes] = useState(defaultProductTypes);
  const [fabrics, setFabrics] = useState(defaultFabrics);
  const [showCustomType, setShowCustomType] = useState(false);
  const [showCustomFabric, setShowCustomFabric] = useState(false);
  const [customType, setCustomType] = useState('');
  const [customFabric, setCustomFabric] = useState('');

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
      const initialColors = Array.isArray(initialData.colors) 
        ? initialData.colors 
        : (initialData.colors ? initialData.colors.split(',').map(c => c.trim()) : []);
      
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
        colors: initialColors,
        sizes: Array.isArray(initialData.sizes) ? initialData.sizes : [],
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

  const handleMainImageChange = async (e) => {
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
      
      // Extract colors from the image
      setExtractingColors(true);
      try {
        const colors = await extractColorsFromImage(file);
        setExtractedColors(colors);
        // Auto-select all extracted colors
        setForm(f => ({
          ...f,
          colors: colors.map(c => c.name)
        }));
        showToast('Colors extracted successfully!', 'success');
      } catch (error) {
        console.error('Failed to extract colors:', error);
        showToast('Failed to extract colors from image', 'error');
      } finally {
        setExtractingColors(false);
      }
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

  const handleSizeToggle = (size) => {
    setForm(f => ({
      ...f,
      sizes: f.sizes.includes(size)
        ? f.sizes.filter(s => s !== size)
        : [...f.sizes, size]
    }));
  };

  const handleColorToggle = (colorName) => {
    setForm(f => ({
      ...f,
      colors: f.colors.includes(colorName)
        ? f.colors.filter(c => c !== colorName)
        : [...f.colors, colorName]
    }));
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setShowCustomType(true);
      setForm(f => ({ ...f, type: '' }));
    } else {
      setShowCustomType(false);
      setForm(f => ({ ...f, type: value }));
    }
  };

  const handleAddCustomType = () => {
    if (customType.trim() && !productTypes.includes(customType.trim())) {
      const newType = customType.trim();
      setProductTypes([...productTypes, newType]);
      setForm(f => ({ ...f, type: newType }));
      setCustomType('');
      setShowCustomType(false);
      showToast(`"${newType}" added to product types`, 'success');
    }
  };

  const handleFabricChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setShowCustomFabric(true);
      setForm(f => ({ ...f, fabric: '' }));
    } else {
      setShowCustomFabric(false);
      setForm(f => ({ ...f, fabric: value }));
    }
  };

  const handleAddCustomFabric = () => {
    if (customFabric.trim() && !fabrics.includes(customFabric.trim())) {
      const newFabric = customFabric.trim();
      setFabrics([...fabrics, newFabric]);
      setForm(f => ({ ...f, fabric: newFabric }));
      setCustomFabric('');
      setShowCustomFabric(false);
      showToast(`"${newFabric}" added to fabrics`, 'success');
    }
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
    if (form.colors.length > 0) formData.append('colors', form.colors.join(', '));
    if (form.sizes.length > 0) formData.append('sizes', form.sizes.join(', '));
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
          <select
            value={showCustomType ? 'custom' : form.type}
            onChange={handleTypeChange}
            style={{ marginBottom: showCustomType ? '8px' : '0' }}
          >
            <option value="">Select Product Type</option>
            {productTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
            <option value="custom">➕ Add New Type...</option>
          </select>
          
          {showCustomType && (
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              marginTop: '8px',
              padding: '12px',
              backgroundColor: '#f9f9f9',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}>
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Enter new product type"
                style={{ flex: 1, marginBottom: 0 }}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomType()}
              />
              <button
                type="button"
                onClick={handleAddCustomType}
                className="admin-btn admin-btn-gold"
                style={{ padding: '8px 16px', fontSize: '14px' }}
                disabled={!customType.trim()}
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCustomType(false);
                  setCustomType('');
                }}
                className="admin-btn admin-btn-outline"
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Cancel
              </button>
            </div>
          )}
          <small style={{ color: '#666', display: 'block', marginTop: '6px' }}>
            Select from list or add a new product type
          </small>
        </div>

        <div className="admin-form-group">
          <label>Fabric</label>
          <select
            value={showCustomFabric ? 'custom' : form.fabric}
            onChange={handleFabricChange}
            style={{ marginBottom: showCustomFabric ? '8px' : '0' }}
          >
            <option value="">Select Fabric</option>
            {fabrics.map((fabric) => (
              <option key={fabric} value={fabric}>{fabric}</option>
            ))}
            <option value="custom">➕ Add New Fabric...</option>
          </select>
          
          {showCustomFabric && (
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              marginTop: '8px',
              padding: '12px',
              backgroundColor: '#f9f9f9',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}>
              <input
                type="text"
                value={customFabric}
                onChange={(e) => setCustomFabric(e.target.value)}
                placeholder="Enter new fabric type"
                style={{ flex: 1, marginBottom: 0 }}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomFabric()}
              />
              <button
                type="button"
                onClick={handleAddCustomFabric}
                className="admin-btn admin-btn-gold"
                style={{ padding: '8px 16px', fontSize: '14px' }}
                disabled={!customFabric.trim()}
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCustomFabric(false);
                  setCustomFabric('');
                }}
                className="admin-btn admin-btn-outline"
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Cancel
              </button>
            </div>
          )}
          <small style={{ color: '#666', display: 'block', marginTop: '6px' }}>
            Select from list or add a new fabric type
          </small>
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
          <label>Colors (Extracted from Image)</label>
          {extractingColors ? (
            <div style={{ 
              padding: '20px', 
              textAlign: 'center', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ fontSize: '14px', color: '#666' }}>Extracting colors from image...</div>
            </div>
          ) : extractedColors.length > 0 ? (
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '12px', 
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9'
            }}>
              {extractedColors.map((color, index) => (
                <label 
                  key={index}
                  style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '8px',
                    border: `2px solid ${form.colors.includes(color.name) ? '#8b7355' : '#ddd'}`,
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    transition: 'all 0.2s ease',
                    minWidth: '80px'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.colors.includes(color.name)}
                    onChange={() => handleColorToggle(color.name)}
                    style={{ display: 'none' }}
                  />
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    borderRadius: '50%',
                    backgroundColor: color.hex,
                    border: '2px solid #ddd',
                    marginBottom: '6px',
                    boxShadow: form.colors.includes(color.name) ? '0 0 0 2px #8b7355' : 'none'
                  }} />
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: form.colors.includes(color.name) ? '600' : '400',
                    color: form.colors.includes(color.name) ? '#8b7355' : '#333'
                  }}>
                    {color.name}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <div style={{ 
              padding: '20px', 
              textAlign: 'center', 
              border: '1px dashed #ddd', 
              borderRadius: '4px',
              backgroundColor: '#f9f9f9',
              color: '#666'
            }}>
              Upload a product image to automatically extract colors
            </div>
          )}
          <small style={{ color: '#666', display: 'block', marginTop: '6px' }}>
            {extractedColors.length > 0 
              ? 'Click on colors to select/deselect them for this product'
              : 'Colors will be automatically detected from the main product image'
            }
          </small>
        </div>

        <div className="admin-form-group">
          <label>Sizes</label>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '10px', 
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9'
          }}>
            {availableSizes.map((size) => (
              <label 
                key={size} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  padding: '8px 14px',
                  border: `2px solid ${form.sizes.includes(size) ? '#8b7355' : '#ddd'}`,
                  borderRadius: '6px',
                  backgroundColor: form.sizes.includes(size) ? '#8b7355' : 'white',
                  color: form.sizes.includes(size) ? 'white' : '#333',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: form.sizes.includes(size) ? '600' : '400',
                  transition: 'all 0.2s ease',
                  userSelect: 'none'
                }}
              >
                <input
                  type="checkbox"
                  checked={form.sizes.includes(size)}
                  onChange={() => handleSizeToggle(size)}
                  style={{ display: 'none' }}
                />
                {size}
              </label>
            ))}
          </div>
          <small style={{ color: '#666', display: 'block', marginTop: '6px' }}>
            Click to select/deselect available sizes
          </small>
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
