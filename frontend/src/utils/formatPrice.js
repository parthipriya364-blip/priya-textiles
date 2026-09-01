// Formats a number as Indian Rupees, e.g. 84999 -> "₹84,999"
export function formatPrice(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export function discountPercent(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}
