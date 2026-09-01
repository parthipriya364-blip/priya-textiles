# Priya Textiles — Luxury E-Commerce Website

A premium, fully responsive React e-commerce site for **Priya Textiles**, an
Indian ethnic-wear brand (sarees, kurtas, lehengas, and family combo sets).
Built with React + Vite + React Router DOM, styled with plain CSS — no UI
framework.

## Getting Started

```bash
npm install
npm run dev       # start local dev server
npm run build     # production build -> dist/
npm run preview   # preview the production build locally
```

## Tech & Structure

```
src/
 ├── assets/        Images & hero video
 ├── components/    Reusable UI: Header, Footer, Hero, ProductCard, etc.
 ├── pages/          One file per route (Home, Women, ProductDetails, ...)
 ├── data/           Product catalogue + query helpers
 ├── context/        CartContext, WishlistContext, AuthContext, ToastContext
 ├── hooks/          useDebounce, useMediaQuery, useScrollToTop
 ├── utils/          formatPrice, validators
 ├── App.jsx          Route table + provider tree
 └── main.jsx
```

## Features

- 15 pages: Home, Women / Men / Kids / Combo collections, New Arrivals,
  Product Details (`/product/:id`), Wishlist, Cart, Checkout, Order Success,
  Login, Register, Contact, About, and a 404 page.
- Cart & wishlist with add / remove / quantity update, persisted to
  `localStorage`.
- Live product search with debounced results dropdown.
- Category & price filtering, sorting on collection pages.
- Mock authentication (register/login/logout) — no backend required; swap
  `context/AuthContext.jsx` for real API calls when one exists.
- Responsive mobile menu, sticky header, toast notifications, skeleton
  loading states, and smooth page/section transitions.

## Notes for going to production

- Product images currently reuse the sample photos in `src/assets` — drop in
  real product photography and update `src/data/products.js`.
- `AuthContext` and the checkout flow are demo-only (no backend/payment
  gateway). Wire them up to real services before taking payments.
- The `logo.png` and hero video are large — consider compressing them or
  swapping in optimized versions before deploying.
