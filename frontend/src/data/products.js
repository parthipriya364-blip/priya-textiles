import women from "../assets/orange.jpg";
import men from "../assets/men.jpg";
import kids from "../assets/kids.png";
import combo from "../assets/combo.jpg";
import girl from "../assets/girl.jpg";
import banner from "../assets/banner.jpg";

// A small, curated catalogue for Priya Textiles. Images are reused across
// entries since the brand currently has a limited photo set — swap in real
// product photography by dropping files into src/assets and pointing here.

const products = [
  // ---------------- WOMEN ----------------
  {
    id: 1,
    name: "Kanjivaram Silk Saree — Maroon & Gold",
    category: "women",
    type: "Saree",
    subCategory: "Silk Sarees",
    price: 8499,
    oldPrice: 11999,
    rating: 4.8,
    reviews: 132,
    image: women,
    gallery: [women, girl, banner],
    isNew: true,
    isFeatured: true,
    fabric: "Pure Kanjivaram Silk",
    colors: ["Maroon", "Gold"],
    sizes: ["Free Size"],
    description:
      "A handwoven Kanjivaram silk saree in deep maroon with a rich gold zari border. Woven by master artisans, finished with a temple-style pallu — an heirloom piece for weddings and festive occasions.",
  },
  {
    id: 2,
    name: "Banarasi Silk Saree — Ivory & Gold",
    category: "women",
    type: "Saree",
    subCategory: "Bridal Sarees",
    price: 9299,
    oldPrice: 12499,
    rating: 4.9,
    reviews: 98,
    image: girl,
    gallery: [girl, women],
    isNew: true,
    isFeatured: true,
    fabric: "Banarasi Silk",
    colors: ["Ivory", "Gold"],
    sizes: ["Free Size"],
    description:
      "Ivory Banarasi silk with an intricate gold brocade weave running through the body and pallu. Lightweight drape, timeless elegance for the modern bride.",
  },
  {
    id: 3,
    name: "Designer Anarkali Gown — Wine",
    category: "women",
    type: "Gown",
    subCategory: "Gowns",
    price: 4999,
    oldPrice: 6999,
    rating: 4.6,
    reviews: 76,
    image: banner,
    gallery: [banner, women],
    isNew: false,
    isFeatured: true,
    fabric: "Georgette",
    colors: ["Wine", "Black"],
    sizes: ["S", "M", "L", "XL"],
    description:
      "A floor-sweeping Anarkali gown in wine georgette with delicate thread embroidery along the yoke. Comes with a matching dupatta finished in gold gota trim.",
  },
  {
    id: 4,
    name: "Chanderi Cotton Kurta Set",
    category: "women",
    type: "Kurta Set",
    subCategory: "Kurtis",
    price: 2799,
    oldPrice: 3499,
    rating: 4.5,
    reviews: 54,
    image: women,
    gallery: [women, girl],
    isNew: false,
    isFeatured: false,
    fabric: "Chanderi Cotton",
    colors: ["Beige", "Maroon"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "Breathable Chanderi cotton kurta with straight-cut palazzo and a printed dupatta. Everyday elegance for the office or a festive brunch.",
  },
  {
    id: 5,
    name: "Bridal Lehenga Choli — Royal Maroon",
    category: "women",
    type: "Lehenga",
    subCategory: "Lehenga",
    price: 15999,
    oldPrice: 21999,
    rating: 5.0,
    reviews: 41,
    image: girl,
    gallery: [girl, banner, women],
    isNew: true,
    isFeatured: true,
    fabric: "Velvet & Net",
    colors: ["Maroon", "Gold"],
    sizes: ["S", "M", "L", "Custom"],
    description:
      "A statement bridal lehenga in royal maroon velvet, hand-embroidered with gold zardozi work, paired with a net dupatta edged in scalloped gold lace.",
  },
  {
    id: 6,
    name: "Linen Straight-Cut Kurti",
    category: "women",
    type: "Kurti",
    subCategory: "Kurtis",
    price: 1899,
    oldPrice: 2399,
    rating: 4.3,
    reviews: 63,
    image: banner,
    gallery: [banner, women],
    isNew: false,
    isFeatured: false,
    fabric: "Pure Linen",
    colors: ["White", "Black"],
    sizes: ["S", "M", "L", "XL"],
    description:
      "A minimal, tailored linen kurti with clean lines and mother-of-pearl buttons — pairs effortlessly with denims or churidar.",
  },

  {
    id: 18,
    name: "Handloom Cotton Saree — Sunrise Yellow",
    category: "women",
    type: "Saree",
    subCategory: "Cotton Sarees",
    price: 1899,
    oldPrice: 2499,
    rating: 4.4,
    reviews: 41,
    image: girl,
    gallery: [girl, banner],
    isNew: false,
    isFeatured: false,
    fabric: "Handloom Cotton",
    colors: ["Yellow", "White"],
    sizes: ["Free Size"],
    description:
      "A breathable handloom cotton saree in sunrise yellow with a simple woven border — everyday elegance for warm afternoons.",
  },
  {
    id: 19,
    name: "Sequinned Party Wear Saree — Midnight Blue",
    category: "women",
    type: "Saree",
    subCategory: "Party Wear",
    price: 5499,
    oldPrice: 7299,
    rating: 4.6,
    reviews: 33,
    image: banner,
    gallery: [banner, women],
    isNew: true,
    isFeatured: false,
    fabric: "Georgette with Sequin Work",
    colors: ["Midnight Blue", "Silver"],
    sizes: ["Free Size"],
    description:
      "A shimmering sequinned georgette saree in midnight blue, cut for evening events and cocktail parties.",
  },
  {
    id: 20,
    name: "Embroidered Chudithar Set — Powder Pink",
    category: "women",
    type: "Chudithar",
    subCategory: "Chudithar",
    price: 2199,
    oldPrice: 2899,
    rating: 4.5,
    reviews: 28,
    image: women,
    gallery: [women, girl],
    isNew: false,
    isFeatured: false,
    fabric: "Cotton Silk",
    colors: ["Powder Pink", "White"],
    sizes: ["S", "M", "L", "XL"],
    description:
      "A soft cotton-silk chudithar set with fine thread embroidery on the yoke, finished with a matching dupatta.",
  },
  {
    id: 21,
    name: "Zari-Border Dupatta — Ivory & Gold",
    category: "women",
    type: "Dupatta",
    subCategory: "Dupatta",
    price: 1299,
    oldPrice: 1699,
    rating: 4.3,
    reviews: 19,
    image: banner,
    gallery: [banner],
    isNew: false,
    isFeatured: false,
    fabric: "Chiffon",
    colors: ["Ivory", "Gold"],
    sizes: ["Free Size"],
    description:
      "A lightweight chiffon dupatta finished with a delicate zari border — an easy layer over kurtis or Anarkalis.",
  },

  // ---------------- MEN ----------------
  {
    id: 7,
    name: "Silk Blend Kurta Pyjama — Black & Gold",
    category: "men",
    type: "Kurta",
    subCategory: null,
    price: 3499,
    oldPrice: 4599,
    rating: 4.7,
    reviews: 88,
    image: men,
    gallery: [men, banner],
    isNew: true,
    isFeatured: true,
    fabric: "Silk Blend",
    colors: ["Black", "Gold"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "A tailored silk-blend kurta pyjama in jet black with a fine gold self-weave. Mandarin collar, mother-of-pearl buttons — sharp enough for a sangeet, subtle enough for dinner.",
  },
  {
    id: 8,
    name: "Handloom Cotton Shirt — Ivory",
    category: "men",
    type: "Shirt",
    subCategory: null,
    price: 1699,
    oldPrice: 2199,
    rating: 4.4,
    reviews: 47,
    image: banner,
    gallery: [banner, men],
    isNew: false,
    isFeatured: false,
    fabric: "Handloom Cotton",
    colors: ["Ivory", "Sky Blue"],
    sizes: ["S", "M", "L", "XL"],
    description:
      "A breathable handloom cotton shirt with a soft slub texture, cut for a relaxed, tailored fit. Built to soften and improve with every wash.",
  },
  {
    id: 9,
    name: "Nehru Jacket — Maroon Velvet",
    category: "men",
    type: "Jacket",
    subCategory: null,
    price: 2999,
    oldPrice: 3999,
    rating: 4.6,
    reviews: 39,
    image: men,
    gallery: [men],
    isNew: true,
    isFeatured: false,
    fabric: "Velvet",
    colors: ["Maroon"],
    sizes: ["M", "L", "XL", "XXL"],
    description:
      "A regal maroon velvet Nehru jacket with gold button detailing — layer it over a kurta or a shirt for instant occasion-wear polish.",
  },
  {
    id: 10,
    name: "Formal Dhoti & Angavastram Set",
    category: "men",
    type: "Dhoti Set",
    subCategory: null,
    price: 2399,
    oldPrice: 2999,
    rating: 4.8,
    reviews: 55,
    image: banner,
    gallery: [banner],
    isNew: false,
    isFeatured: true,
    fabric: "Pure Cotton Silk",
    colors: ["Cream", "Gold Border"],
    sizes: ["Free Size"],
    description:
      "A traditional cream dhoti with a woven gold border, paired with a matching angavastram — festive-ready with an heirloom finish.",
  },
  {
    id: 11,
    name: "Linen Casual Shirt — Sand",
    category: "men",
    type: "Shirt",
    subCategory: null,
    price: 1499,
    oldPrice: 1899,
    rating: 4.2,
    reviews: 29,
    image: men,
    gallery: [men, banner],
    isNew: false,
    isFeatured: false,
    fabric: "Linen",
    colors: ["Sand", "Olive"],
    sizes: ["S", "M", "L", "XL"],
    description:
      "An easy, breathable linen shirt in warm sand — built for humid days and unhurried evenings alike.",
  },

  // ---------------- KIDS ----------------
  {
    id: 12,
    name: "Kids Pattu Pavadai — Pink & Gold",
    category: "kids",
    type: "Pavadai",
    subCategory: null,
    price: 1999,
    oldPrice: 2599,
    rating: 4.7,
    reviews: 34,
    image: kids,
    gallery: [kids],
    isNew: true,
    isFeatured: true,
    fabric: "Silk Blend",
    colors: ["Pink", "Gold"],
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    description:
      "A miniature silk-blend pavadai in candy pink with a gold zari border — matching outfits available in the Combo collection.",
  },
  {
    id: 13,
    name: "Boys Ethnic Kurta Set — Cream",
    category: "kids",
    type: "Kurta Set",
    subCategory: null,
    price: 1599,
    oldPrice: 1999,
    rating: 4.5,
    reviews: 21,
    image: kids,
    gallery: [kids, men],
    isNew: false,
    isFeatured: false,
    fabric: "Cotton Silk",
    colors: ["Cream", "Maroon"],
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"],
    description:
      "A comfortable cotton-silk kurta set for little ones, finished with fine maroon piping — soft on skin, festive by design.",
  },
  {
    id: 14,
    name: "Kids Party Frock — Ivory Lace",
    category: "kids",
    type: "Frock",
    subCategory: null,
    price: 1799,
    oldPrice: 2299,
    rating: 4.4,
    reviews: 18,
    image: kids,
    gallery: [kids],
    isNew: true,
    isFeatured: false,
    fabric: "Net & Cotton Lining",
    colors: ["Ivory"],
    sizes: ["2-3Y", "4-5Y", "6-7Y"],
    description:
      "A twirl-ready party frock in ivory net with a soft cotton lining — comfortable enough for a full evening of celebration.",
  },

  // ---------------- COMBO ----------------
  {
    id: 15,
    name: "Family Festive Combo — His & Hers",
    category: "combo",
    type: "Combo Set",
    subCategory: null,
    price: 6499,
    oldPrice: 8999,
    rating: 4.9,
    reviews: 27,
    image: combo,
    gallery: [combo, men, women],
    isNew: true,
    isFeatured: true,
    fabric: "Silk Blend",
    colors: ["Maroon", "Gold"],
    sizes: ["Customisable"],
    description:
      "A coordinated maroon-and-gold set — a silk-blend kurta for him and a matching saree for her — designed to photograph beautifully together.",
  },
  {
    id: 16,
    name: "Mother-Daughter Combo — Pink Silk",
    category: "combo",
    type: "Combo Set",
    subCategory: null,
    price: 5299,
    oldPrice: 6999,
    rating: 4.8,
    reviews: 22,
    image: combo,
    gallery: [combo, girl, kids],
    isNew: true,
    isFeatured: true,
    fabric: "Silk Blend",
    colors: ["Pink", "Gold"],
    sizes: ["Customisable"],
    description:
      "Matching pink silk-blend outfits for mother and daughter, each finished with a gold zari border — a favourite for festival mornings.",
  },
  {
    id: 17,
    name: "Full Family Combo — 4 Piece Set",
    category: "combo",
    type: "Combo Set",
    subCategory: null,
    price: 11999,
    oldPrice: 15999,
    rating: 4.9,
    reviews: 15,
    image: combo,
    gallery: [combo, men, women, kids],
    isNew: false,
    isFeatured: true,
    fabric: "Mixed Silk & Cotton",
    colors: ["Maroon", "Gold", "Cream"],
    sizes: ["Customisable"],
    description:
      "Coordinated outfits for the whole family — father, mother and two children — in a shared maroon-and-gold palette for your next family portrait.",
  },
];

export default products;

export const getAllProducts = () => products;

export const getProductById = (id) =>
  products.find((p) => p.id === Number(id));

export const getProductsByCategory = (category) =>
  category === "all"
    ? products
    : products.filter((p) => p.category === category);

// "New Arrivals" is a virtual sub-category — it maps to the isNew flag
// rather than a literal subCategory match, so it always reflects the
// freshest stock without needing every new product manually tagged.
export const getProductsBySubCategory = (category, subCategoryName) => {
  const inCategory = getProductsByCategory(category);
  if (subCategoryName === "New Arrivals") {
    return inCategory.filter((p) => p.isNew);
  }
  return inCategory.filter((p) => p.subCategory === subCategoryName);
};

export const getFeaturedProducts = () => products.filter((p) => p.isFeatured);

export const getNewArrivals = () => products.filter((p) => p.isNew);

export const getRelatedProducts = (product, limit = 4) =>
  products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);

export const searchProducts = (query) => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.fabric.toLowerCase().includes(q)
  );
};

export const categoryMeta = {
  women: { title: "Women's Collection", image: women, tagline: "Sarees, gowns & kurta sets woven with heritage." },
  men: { title: "Men's Collection", image: men, tagline: "Kurtas, shirts & jackets tailored for every occasion." },
  kids: { title: "Kids' Collection", image: kids, tagline: "Miniature festive wear, made to twirl and play in." },
  combo: { title: "Combo Collection", image: combo, tagline: "Coordinated family sets for your next big celebration." },
};
