import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getBanners, createBanner, updateBanner, deleteBanner, toggleBannerEnabled, reorderBanner } from "../services/bannerService";
import { useToast } from "./ToastContext";

const BannerContext = createContext(null);
export const MAX_BANNERS = 5;

export function BannerProvider({ children }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Load banners from API on mount
  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await getBanners();
      setBanners(data.banners || []);
    } catch (error) {
      console.error('Failed to load banners:', error);
      showToast?.('Failed to load banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  const activeBanners = useMemo(
    () =>
      [...banners]
        .filter((b) => b.enabled)
        .sort((a, b) => a.order - b.order),
    [banners]
  );

  const addBanner = async ({ image, title = "", subtitle = "", link = "" }) => {
    if (banners.length >= MAX_BANNERS) {
      return { ok: false, error: `Maximum of ${MAX_BANNERS} banners allowed.` };
    }

    try {
      const data = await createBanner({ image, title, subtitle, link });
      setBanners((prev) => [...prev, data.banner]);
      showToast?.(data.message || 'Banner added successfully', 'success');
      return { ok: true };
    } catch (error) {
      const message = error.message || 'Failed to add banner';
      showToast?.(message, 'error');
      return { ok: false, error: message };
    }
  };

  const replaceBanner = async (id, image) => {
    try {
      const data = await updateBanner(id, { image });
      setBanners((prev) => prev.map((b) => (b._id === id ? data.banner : b)));
      showToast?.(data.message || 'Banner updated successfully', 'success');
      return { ok: true };
    } catch (error) {
      const message = error.message || 'Failed to replace banner';
      showToast?.(message, 'error');
      return { ok: false, error: message };
    }
  };

  const updateBannerData = async (id, updates) => {
    try {
      const data = await updateBanner(id, updates);
      setBanners((prev) => prev.map((b) => (b._id === id ? data.banner : b)));
      showToast?.(data.message || 'Banner updated successfully', 'success');
      return { ok: true };
    } catch (error) {
      const message = error.message || 'Failed to update banner';
      showToast?.(message, 'error');
      return { ok: false, error: message };
    }
  };

  const removeBanner = async (id) => {
    try {
      const data = await deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b._id !== id));
      showToast?.(data.message || 'Banner deleted successfully', 'success');
      return { ok: true };
    } catch (error) {
      const message = error.message || 'Failed to delete banner';
      showToast?.(message, 'error');
      return { ok: false, error: message };
    }
  };

  const toggleEnabled = async (id) => {
    try {
      const data = await toggleBannerEnabled(id);
      setBanners((prev) => prev.map((b) => (b._id === id ? data.banner : b)));
      showToast?.(data.message || 'Banner status updated', 'success');
      return { ok: true };
    } catch (error) {
      const message = error.message || 'Failed to toggle banner status';
      showToast?.(message, 'error');
      return { ok: false, error: message };
    }
  };

  const reorderBannerItem = async (id, direction) => {
    try {
      const data = await reorderBanner(id, direction);
      setBanners(data.banners || []);
      return { ok: true };
    } catch (error) {
      const message = error.message || 'Failed to reorder banner';
      showToast?.(message, 'error');
      return { ok: false, error: message };
    }
  };

  return (
    <BannerContext.Provider
      value={{
        banners,
        activeBanners,
        loading,
        maxBanners: MAX_BANNERS,
        addBanner,
        replaceBanner,
        updateBanner: updateBannerData,
        deleteBanner: removeBanner,
        toggleEnabled,
        reorderBanner: reorderBannerItem,
        refreshBanners: loadBanners,
      }}
    >
      {children}
    </BannerContext.Provider>
  );
}

export function useBanners() {
  const ctx = useContext(BannerContext);
  if (!ctx) throw new Error("useBanners must be used within a BannerProvider");
  return ctx;
}
