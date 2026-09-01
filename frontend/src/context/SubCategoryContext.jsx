import { createContext, useContext, useEffect, useState } from "react";
import { getSubCategories } from "../services/categoryService";

const SubCategoryContext = createContext(null);

/**
 * Live subcategories store that fetches data from the database.
 * Used by both the storefront slider and admin Sub-Category manager.
 * Automatically refreshes when data changes in admin panel.
 */
export function SubCategoryProvider({ children }) {
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubCategories();
  }, []);

  const loadSubCategories = async () => {
    try {
      setLoading(true);
      const data = await getSubCategories(); // Get all subcategories
      setSubCategories(data.subcategories || []);
    } catch (error) {
      console.error('Failed to load subcategories:', error);
      setSubCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const getActiveByCategory = (categoryName) =>
    subCategories
      .filter((s) => s.categoryName === categoryName && s.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);

  const getAllByCategory = (categoryName) =>
    subCategories
      .filter((s) => s.categoryName === categoryName)
      .sort((a, b) => a.displayOrder - b.displayOrder);

  // Convert database subcategories to the format expected by the slider
  const activeWomenSubCategories = getActiveByCategory("Women").map(sc => ({
    id: sc._id,
    name: sc.name,
    image: sc.image?.url || '',
    status: sc.isActive,
    displayOrder: sc.displayOrder,
    category: 'women',
  }));

  // Refresh function that can be called from admin panel
  const refresh = () => {
    loadSubCategories();
  };

  return (
    <SubCategoryContext.Provider
      value={{
        subCategories,
        activeWomenSubCategories,
        getActiveByCategory,
        getAllByCategory,
        loading,
        refresh,
      }}
    >
      {children}
    </SubCategoryContext.Provider>
  );
}

export function useSubCategories() {
  const ctx = useContext(SubCategoryContext);
  if (!ctx)
    throw new Error("useSubCategories must be used within a SubCategoryProvider");
  return ctx;
}
