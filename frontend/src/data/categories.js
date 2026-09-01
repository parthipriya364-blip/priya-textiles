// Central category list — the single source of truth for top-level
// categories. Only "women" has sub-categories (see subCategories.js).
export const categories = [
  { id: 1, name: "Women", slug: "women" },
  { id: 2, name: "Men", slug: "men" },
  { id: 3, name: "Kids", slug: "kids" },
  { id: 4, name: "Combo", slug: "combo" },
];

export const getCategoryBySlug = (slug) =>
  categories.find((c) => c.slug === slug);

export default categories;
