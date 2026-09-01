import banner1 from "../assets/banners/banner1.jpg";
import banner2 from "../assets/banners/banner2.jpg";
import banner3 from "../assets/banners/banner3.jpg";
import banner4 from "../assets/banners/banner4.jpg";
import banner5 from "../assets/banners/banner5.jpg";

// Static seed data for the hero slider. BannerContext reads this on first
// load; when a real backend/CMS exists, swap the context's data source for
// an API call and this file becomes the fallback/demo dataset.
const banners = [
  {
    id: 1,
    image: banner1,
    title: "Priya Textiles",
    subtitle: "Where heritage weaving meets modern luxury",
    order: 1,
    enabled: true,
  },
  {
    id: 2,
    image: banner2,
    title: "Celebrations, Woven Together",
    subtitle: "Festive sarees and family sets for every generation",
    order: 2,
    enabled: true,
  },
  {
    id: 3,
    image: banner3,
    title: "Timeless Silk, Modern Grace",
    subtitle: "Handpicked Kanjivarams and designer weaves",
    order: 3,
    enabled: true,
  },
  {
    id: 4,
    image: banner4,
    title: "Family Combo Collections",
    subtitle: "Matching sets designed for togetherness",
    order: 4,
    enabled: true,
  },
  {
    id: 5,
    image: banner5,
    title: "Timeless Craftsmanship",
    subtitle: "Every piece tells a story of artistry",
    order: 5,
    enabled: true,
  },
];

export default banners;
