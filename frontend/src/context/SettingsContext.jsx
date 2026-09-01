import { createContext, useContext, useEffect, useState } from "react";
import { getPublicSettings } from "../services/settingsService";

const SettingsContext = createContext(null);

export const DEFAULT_SETTINGS = {
  storeName: "Priya Textiles",
  storeEmail: "Parthipriya364@gmail.com",
  phone: "+91 8807329146",
  address: "KVP Theatre Road, Elampillai, Salem District, Tamil Nadu – 637502, India",
  storeDescription:
    "Handcrafted sarees, kurtas and ethnic wear woven with heritage techniques — bringing tradition and modern elegance to every wardrobe.",
  logo: "",
  instagram: "https://www.instagram.com/priya_textiles_offcial",
  facebook: "https://www.facebook.com/share/18xW8MusUV/",
  youtube: "https://youtube.com/@priyatextil",
  twitter: "",
  whatsapp: "",
  businessHours: {
    monday: "9:00 AM - 10:00 PM",
    tuesday: "9:00 AM - 10:00 PM",
    wednesday: "9:00 AM - 10:00 PM",
    thursday: "9:00 AM - 10:00 PM",
    friday: "9:00 AM - 10:00 PM",
    saturday: "9:00 AM - 10:00 PM",
    sunday: "Closed",
  },
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await getPublicSettings();
        if (!cancelled && response?.settings) {
          const s = response.settings;
          setSettings({
            storeName: s.storeName || DEFAULT_SETTINGS.storeName,
            storeEmail: s.storeEmail || DEFAULT_SETTINGS.storeEmail,
            phone: s.phone || DEFAULT_SETTINGS.phone,
            address: s.address || DEFAULT_SETTINGS.address,
            storeDescription: s.storeDescription || DEFAULT_SETTINGS.storeDescription,
            logo: s.logo || "",
            instagram: s.instagram || DEFAULT_SETTINGS.instagram,
            facebook: s.facebook || DEFAULT_SETTINGS.facebook,
            youtube: s.youtube || DEFAULT_SETTINGS.youtube,
            twitter: s.twitter || "",
            whatsapp: s.whatsapp || "",
            businessHours: s.businessHours || DEFAULT_SETTINGS.businessHours,
          });
        }
      } catch (err) {
        // Keep defaults silently — API may be unavailable
        console.error("SettingsContext: failed to load settings", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // Called by admin Settings page after saving so all components update immediately
  const refreshSettings = async () => {
    try {
      const response = await getPublicSettings();
      if (response?.settings) {
        const s = response.settings;
        setSettings({
          storeName: s.storeName || DEFAULT_SETTINGS.storeName,
          storeEmail: s.storeEmail || DEFAULT_SETTINGS.storeEmail,
          phone: s.phone || DEFAULT_SETTINGS.phone,
          address: s.address || DEFAULT_SETTINGS.address,
          storeDescription: s.storeDescription || DEFAULT_SETTINGS.storeDescription,
          logo: s.logo || "",
          instagram: s.instagram || DEFAULT_SETTINGS.instagram,
          facebook: s.facebook || DEFAULT_SETTINGS.facebook,
          youtube: s.youtube || DEFAULT_SETTINGS.youtube,
          twitter: s.twitter || "",
          whatsapp: s.whatsapp || "",
          businessHours: s.businessHours || DEFAULT_SETTINGS.businessHours,
        });
      }
    } catch (err) {
      console.error("SettingsContext: failed to refresh settings", err);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}
