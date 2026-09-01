import women from "../assets/women.jpg";
import girl from "../assets/girl.jpg";
import banner from "../assets/banner.jpg";

// Seed data for Women's sub-categories. This is only the INITIAL/fallback
// data — the live, editable copy lives in SubCategoryContext (persisted to
// localStorage) so admin changes (rename, reorder, enable/disable, image)
// take effect instantly across the site without a backend.
export const subCategories = [
  { id: 1, category: "women", name: "New Arrivals", image: women, status: true, displayOrder: 1 },
  { id: 2, category: "women", name: "Silk Sarees", image: girl, status: true, displayOrder: 2 },
  { id: 3, category: "women", name: "Cotton Sarees", image: banner, status: true, displayOrder: 3 },
  { id: 4, category: "women", name: "Bridal Sarees", image: women, status: true, displayOrder: 4 },
  { id: 5, category: "women", name: "Party Wear", image: girl, status: true, displayOrder: 5 },
  { id: 6, category: "women", name: "Kurtis", image: banner, status: true, displayOrder: 6 },
  { id: 7, category: "women", name: "Gowns", image: women, status: true, displayOrder: 7 },
  { id: 8, category: "women", name: "Chudithar", image: girl, status: true, displayOrder: 8 },
  { id: 9, category: "women", name: "Lehenga", image: banner, status: true, displayOrder: 9 },
  { id: 10, category: "women", name: "Dupatta", image: women, status: true, displayOrder: 10 },
];

export default subCategories;
