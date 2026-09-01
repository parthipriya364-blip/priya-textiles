import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaCloudUploadAlt, FaLayerGroup, FaArrowUp, FaArrowDown, FaToggleOn, FaToggleOff, FaSpinner } from "react-icons/fa";
import AdminPageHeader from "./components/AdminPageHeader";
import Modal from "./components/Modal";
import { useToast } from "../context/ToastContext";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  initializeCategories,
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  reorderSubCategory,
  toggleSubCategoryStatus,
} from "../services/categoryService";
import "./admin-forms.css";
import "./Categories.css";

const emptyForm = { name: "", description: "", order: 0, image: null, imagePreview: "" };
const emptySubForm = { name: "", description: "", displayOrder: 0, image: null, imagePreview: "" };

export default function Categories() {
  const { showToast } = useToast();
  
  // Categories state
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Sub-Category state
  const [womenCategory, setWomenCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [subManagerOpen, setSubManagerOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [subForm, setSubForm] = useState(emptySubForm);
  const [deleteSubTarget, setDeleteSubTarget] = useState(null);
  const [subLoading, setSubLoading] = useState(false);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load categories
  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data.categories || []);
      
      // Find Women category for subcategories
      const women = data.categories?.find(c => c.name === 'Women');
      setWomenCategory(women);
    } catch (error) {
      showToast(error.message || 'Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load subcategories for Women
  const loadSubCategories = async () => {
    if (!womenCategory) return;
    
    setSubLoading(true);
    try {
      const data = await getSubCategories('women');
      setSubCategories(data.subcategories || []);
    } catch (error) {
      showToast(error.message || 'Failed to load subcategories', 'error');
    } finally {
      setSubLoading(false);
    }
  };

  // Initialize default categories
  const handleInitialize = async () => {
    if (!window.confirm('Initialize default categories (Women, Men, Kids, Combo)?')) return;
    
    setLoading(true);
    try {
      await initializeCategories();
      showToast('Categories initialized successfully!', 'success');
      loadCategories();
    } catch (error) {
      showToast(error.message || 'Failed to initialize categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open add category modal
  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  // Open edit category modal
  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description || '',
      order: cat.order || 0,
      image: null,
      imagePreview: cat.image?.url || '',
    });
    setModalOpen(true);
  };

  // Handle category image selection
  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
      }
      
      setForm((f) => ({
        ...f,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  // Save category (create or update)
  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!form.name) {
      showToast('Please enter category name', 'error');
      return;
    }
    
    if (!editing && !form.image) {
      showToast('Please select an image', 'error');
      return;
    }

    setSubmitting(true);
    
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('order', form.order);
      if (form.image) {
        formData.append('image', form.image);
      }

      if (editing) {
        await updateCategory(editing._id, formData);
        showToast('Category updated successfully!', 'success');
      } else {
        await createCategory(formData);
        showToast('Category created successfully!', 'success');
      }

      setModalOpen(false);
      loadCategories();
    } catch (error) {
      showToast(error.message || 'Failed to save category', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete category
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setSubmitting(true);
    try {
      await deleteCategory(deleteTarget._id);
      showToast('Category deleted successfully!', 'success');
      setDeleteTarget(null);
      loadCategories();
    } catch (error) {
      showToast(error.message || 'Failed to delete category', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open subcategories manager
  const openSubManager = () => {
    if (!womenCategory) {
      showToast('Women category not found', 'error');
      return;
    }
    setSubManagerOpen(true);
    loadSubCategories();
  };

  // Open add subcategory modal
  const openSubAdd = () => {
    setEditingSub(null);
    setSubForm(emptySubForm);
    setSubModalOpen(true);
  };

  // Open edit subcategory modal
  const openSubEdit = (sc) => {
    setEditingSub(sc);
    setSubForm({
      name: sc.name,
      description: sc.description || '',
      displayOrder: sc.displayOrder || 0,
      image: null,
      imagePreview: sc.image?.url || '',
    });
    setSubModalOpen(true);
  };

  // Handle subcategory image selection
  const handleSubImage = (e) => {
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
      
      setSubForm((f) => ({
        ...f,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  // Save subcategory
  const handleSubSave = async (e) => {
    e.preventDefault();
    
    if (!subForm.name) {
      showToast('Please enter subcategory name', 'error');
      return;
    }
    
    if (!editingSub && !subForm.image) {
      showToast('Please select an image', 'error');
      return;
    }

    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('name', subForm.name);
      formData.append('description', subForm.description);
      formData.append('displayOrder', subForm.displayOrder);
      formData.append('categoryId', womenCategory._id);
      formData.append('categoryName', 'Women');
      if (subForm.image) {
        formData.append('image', subForm.image);
      }

      if (editingSub) {
        await updateSubCategory(editingSub._id, formData);
        showToast('Subcategory updated successfully!', 'success');
      } else {
        await createSubCategory(formData);
        showToast('Subcategory created successfully!', 'success');
      }

      setSubModalOpen(false);
      loadSubCategories();
    } catch (error) {
      showToast(error.message || 'Failed to save subcategory', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete subcategory
  const confirmSubDelete = async () => {
    if (!deleteSubTarget) return;

    setSubmitting(true);
    try {
      await deleteSubCategory(deleteSubTarget._id);
      showToast('Subcategory deleted successfully!', 'success');
      setDeleteSubTarget(null);
      loadSubCategories();
    } catch (error) {
      showToast(error.message || 'Failed to delete subcategory', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Reorder subcategory
  const handleReorder = async (id, direction) => {
    try {
      await reorderSubCategory(id, direction);
      loadSubCategories();
    } catch (error) {
      showToast(error.message || 'Failed to reorder', 'error');
    }
  };

  // Toggle subcategory status
  const handleToggleStatus = async (id) => {
    try {
      await toggleSubCategoryStatus(id);
      showToast('Status updated successfully!', 'success');
      loadSubCategories();
    } catch (error) {
      showToast(error.message || 'Failed to toggle status', 'error');
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        subtitle={loading ? 'Loading...' : `${categories.length} categories`}
        action={
          <div style={{ display: 'flex', gap: '10px' }}>
            {categories.length === 0 && (
              <button className="admin-btn admin-btn-outline" onClick={handleInitialize} disabled={loading}>
                Initialize Categories
              </button>
            )}
            <button className="admin-btn admin-btn-gold" onClick={openAdd} disabled={loading}>
              <FaPlus /> Add Category
            </button>
          </div>
        }
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <FaSpinner className="fa-spin" size={32} />
          <p style={{ marginTop: '10px' }}>Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="table-empty">
          No categories yet. Click "Initialize Categories" to create default categories.
        </div>
      ) : (
        <div className="category-cards">
          {categories.map((cat) => (
            <div className="category-admin-card" key={cat._id}>
              <img src={cat.image?.url} alt={cat.name} />
              <div className="category-admin-info">
                <h3>{cat.name}</h3>
                <span>{cat.productsCount || 0} products</span>
                {cat.description && <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{cat.description}</p>}
              </div>
              <div className="row-actions">
                {cat.name === 'Women' && (
                  <button
                    className="row-action-btn"
                    onClick={openSubManager}
                    aria-label="Manage Sub-Categories"
                    title="Manage Sub-Categories"
                  >
                    <FaLayerGroup />
                  </button>
                )}
                <button className="row-action-btn" onClick={() => openEdit(cat)} aria-label="Edit">
                  <FaEdit />
                </button>
                <button
                  className="row-action-btn danger"
                  onClick={() => setDeleteTarget(cat)}
                  aria-label="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Category Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Category" : "Add Category"}
        size="sm"
      >
        <form onSubmit={handleSave}>
          <div className="admin-form-group">
            <label>Category Name *</label>
            <select
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              disabled={!!editing}
            >
              <option value="">Select Category</option>
              <option value="Women">Women</option>
              <option value="Men">Men</option>
              <option value="Kids">Kids</option>
              <option value="Combo">Combo</option>
            </select>
            {editing && <small style={{ color: '#666' }}>Category name cannot be changed</small>}
          </div>

          <div className="admin-form-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows="3"
              placeholder="Category description"
            />
          </div>

          <div className="admin-form-group">
            <label>Display Order</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))}
              min="0"
            />
          </div>

          <div className="admin-form-group">
            <label>Category Image {!editing && '*'}</label>
            <label className="image-upload-box">
              <FaCloudUploadAlt size={20} style={{ marginBottom: 6 }} />
              <br />
              Click to upload image
              <input type="file" accept="image/*" hidden onChange={handleImage} />
            </label>
            {form.imagePreview && (
              <div className="image-preview-strip">
                <img src={form.imagePreview} alt="Preview" />
              </div>
            )}
            <small style={{ color: '#666' }}>Max size: 5MB. Formats: JPG, PNG, GIF, WebP</small>
          </div>

          <div className="row-actions" style={{ gap: 12, marginTop: 20 }}>
            <button type="submit" className="admin-btn admin-btn-gold" disabled={submitting}>
              {submitting ? <><FaSpinner className="fa-spin" /> Saving...</> : editing ? "Update Category" : "Add Category"}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-outline"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Category Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Category"
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
        <p>Delete <b>{deleteTarget?.name}</b>? This action cannot be undone.</p>
      </Modal>

      {/* Women Sub-Category Manager Modal */}
      <Modal
        open={subManagerOpen}
        onClose={() => setSubManagerOpen(false)}
        title="Women — Sub-Category Management"
        size="lg"
      >
        <div className="admin-toolbar" style={{ marginBottom: 16 }}>
          <span style={{ fontFamily: "var(--f-body)", fontSize: 13, color: "var(--c-gray)" }}>
            {subCategories.length} sub-categories
          </span>
          <button className="admin-btn admin-btn-gold" onClick={openSubAdd}>
            <FaPlus /> Add Sub-Category
          </button>
        </div>

        {subLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <FaSpinner className="fa-spin" size={24} />
          </div>
        ) : (
          <div className="subcat-list">
            {subCategories.map((sc, i) => (
              <div className={`subcat-row ${sc.isActive ? "" : "disabled"}`} key={sc._id}>
                <div className="subcat-thumb">
                  {sc.image?.url ? <img src={sc.image.url} alt={sc.name} /> : <span>{sc.name.charAt(0)}</span>}
                </div>
                <div className="subcat-row-info">
                  <strong>{sc.name}</strong>
                  <span>Order {sc.displayOrder}{!sc.isActive && " · Disabled"}</span>
                </div>
                <div className="row-actions">
                  <button
                    className="row-action-btn"
                    onClick={() => handleReorder(sc._id, 'up')}
                    disabled={i === 0}
                    aria-label="Move up"
                    title="Move up"
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    className="row-action-btn"
                    onClick={() => handleReorder(sc._id, 'down')}
                    disabled={i === subCategories.length - 1}
                    aria-label="Move down"
                    title="Move down"
                  >
                    <FaArrowDown />
                  </button>
                  <button
                    className="row-action-btn"
                    onClick={() => handleToggleStatus(sc._id)}
                    aria-label={sc.isActive ? "Disable" : "Enable"}
                    title={sc.isActive ? "Disable" : "Enable"}
                  >
                    {sc.isActive ? <FaToggleOn color="var(--c-gold-deep)" size={18} /> : <FaToggleOff size={18} />}
                  </button>
                  <button className="row-action-btn" onClick={() => openSubEdit(sc)} aria-label="Edit">
                    <FaEdit />
                  </button>
                  <button
                    className="row-action-btn danger"
                    onClick={() => setDeleteSubTarget(sc)}
                    aria-label="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
            {subCategories.length === 0 && (
              <div className="table-empty">No sub-categories yet — add one to get started.</div>
            )}
          </div>
        )}
      </Modal>

      {/* Add/Edit SubCategory Modal */}
      <Modal
        open={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        title={editingSub ? "Edit Sub-Category" : "Add Sub-Category"}
        size="sm"
      >
        <form onSubmit={handleSubSave}>
          <div className="admin-form-group">
            <label>Sub-Category Name *</label>
            <input
              type="text"
              value={subForm.name}
              onChange={(e) => setSubForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Sarees, Kurtis"
              required
            />
          </div>

          <div className="admin-form-group">
            <label>Description</label>
            <textarea
              value={subForm.description}
              onChange={(e) => setSubForm((f) => ({ ...f, description: e.target.value }))}
              rows="2"
              placeholder="Optional description"
            />
          </div>

          <div className="admin-form-group">
            <label>Sub-Category Image {!editingSub && '*'}</label>
            <label className="image-upload-box">
              <FaCloudUploadAlt size={20} style={{ marginBottom: 6 }} />
              <br />
              Click to upload image
              <input type="file" accept="image/*" hidden onChange={handleSubImage} />
            </label>
            {subForm.imagePreview && (
              <div className="image-preview-strip">
                <img src={subForm.imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="row-actions" style={{ gap: 12, marginTop: 20 }}>
            <button type="submit" className="admin-btn admin-btn-gold" disabled={submitting}>
              {submitting ? <><FaSpinner className="fa-spin" /> Saving...</> : editingSub ? "Update Sub-Category" : "Add Sub-Category"}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-outline"
              onClick={() => setSubModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete SubCategory Modal */}
      <Modal
        open={!!deleteSubTarget}
        onClose={() => setDeleteSubTarget(null)}
        title="Delete Sub-Category"
        size="sm"
        footer={
          <>
            <button className="admin-btn admin-btn-outline" onClick={() => setDeleteSubTarget(null)} disabled={submitting}>
              Cancel
            </button>
            <button className="admin-btn admin-btn-maroon" onClick={confirmSubDelete} disabled={submitting}>
              {submitting ? <><FaSpinner className="fa-spin" /> Deleting...</> : 'Delete'}
            </button>
          </>
        }
      >
        <p>Delete <b>{deleteSubTarget?.name}</b>? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
