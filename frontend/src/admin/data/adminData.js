// Sample / demo data only — no backend. Products are pulled from the live
// storefront catalogue so admin edits would (in a real backend) reflect
// on the customer site; everything else here is mocked for the UI.
import products from "../../data/products";

export const adminProducts = products.map((p) => ({
  ...p,
  sku: `PT-${String(p.id).padStart(4, "0")}`,
  stock: [0, 3, 8, 14, 22, 40][p.id % 6],
  brand: "Priya Textiles",
}));

export const categories = [
  { id: "women", name: "Women", image: products[0]?.image, productCount: products.filter((p) => p.category === "women").length },
  { id: "men", name: "Men", image: products.find((p) => p.category === "men")?.image, productCount: products.filter((p) => p.category === "men").length },
  { id: "kids", name: "Kids", image: products.find((p) => p.category === "kids")?.image, productCount: products.filter((p) => p.category === "kids").length },
  { id: "combo", name: "Combo", image: products.find((p) => p.category === "combo")?.image, productCount: products.filter((p) => p.category === "combo").length },
];

const customerNames = [
  "Meena Ramesh", "Anitha Kumar", "Divya Shankar", "Priya Nair", "Karthik Iyer",
  "Sneha Reddy", "Arjun Menon", "Lakshmi Rao", "Vikram Suresh", "Pooja Varma",
];

export const customers = customerNames.map((name, i) => ({
  id: i + 1,
  name,
  email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
  phone: `+91 9${(800000000 + i * 137631).toString().slice(0, 9)}`,
  city: ["Coimbatore", "Chennai", "Bengaluru", "Hyderabad", "Madurai", "Kochi", "Mysuru", "Salem", "Trichy", "Vellore"][i],
  orders: [3, 1, 5, 2, 8, 1, 4, 2, 6, 1][i],
  totalPurchase: [24500, 8499, 41200, 15600, 62800, 3299, 28700, 12100, 47600, 4599][i],
}));

const statuses = ["Delivered", "Shipped", "Processing", "Cancelled"];
const paymentStatuses = ["Paid", "Pending", "Failed"];

export const orders = Array.from({ length: 12 }).map((_, i) => {
  const product = adminProducts[i % adminProducts.length];
  const customer = customers[i % customers.length];
  const qty = (i % 3) + 1;
  return {
    id: `PT${10230 + i}`,
    customer: customer.name,
    product: product.name,
    quantity: qty,
    amount: product.price * qty,
    paymentStatus: paymentStatuses[i % paymentStatuses.length],
    orderStatus: statuses[i % statuses.length],
    date: new Date(2026, 6, 28 - i * 2).toISOString().slice(0, 10),
  };
});

export const reviews = [
  { id: 1, product: "Kanjivaram Silk Saree — Maroon & Gold", customer: "Meena Ramesh", rating: 5, message: "Beautiful weave and rich colour, exactly as pictured. Very happy with the purchase!", verified: true },
  { id: 2, product: "Banarasi Silk Saree — Ivory & Gold", customer: "Anitha Kumar", rating: 4, message: "Good quality fabric, delivery was quick and packaging was premium.", verified: true },
  { id: 3, product: "Men's Nehru Jacket — Charcoal", customer: "Karthik Iyer", rating: 5, message: "Perfect fit and finish, wore it to a wedding and got so many compliments.", verified: true },
  { id: 4, product: "Kids Festive Kurta Set", customer: "Divya Shankar", rating: 5, message: "Lovely fabric, my son loved wearing it for Diwali.", verified: false },
  { id: 5, product: "Bridal Combo Set", customer: "Pooja Varma", rating: 4, message: "Great value for a combo, blouse fitting needed minor alteration.", verified: true },
];

export const monthlyRevenue = [
  { label: "Jan", value: 182000 }, { label: "Feb", value: 154000 },
  { label: "Mar", value: 210000 }, { label: "Apr", value: 198000 },
  { label: "May", value: 246000 }, { label: "Jun", value: 268000 },
  { label: "Jul", value: 301000 },
];

export const weeklySales = [
  { label: "Mon", value: 42 }, { label: "Tue", value: 58 },
  { label: "Wed", value: 51 }, { label: "Thu", value: 66 },
  { label: "Fri", value: 74 }, { label: "Sat", value: 91 },
  { label: "Sun", value: 68 },
];

export const categorySales = [
  { label: "Women", value: 52 },
  { label: "Men", value: 21 },
  { label: "Kids", value: 15 },
  { label: "Combo", value: 12 },
];

export const dashboardStats = {
  totalRevenue: monthlyRevenue.reduce((s, m) => s + m.value, 0),
  todaysSales: 18400,
  orders: orders.length,
  products: adminProducts.length,
  customers: customers.length,
  reviews: reviews.length,
  lowStock: adminProducts.filter((p) => p.stock <= 3).length,
};
