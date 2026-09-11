import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { initAuth } from "./services/authService";
import Layout from "./components/Layout";
import FloatingContact from "./components/FloatingContact";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { BannerProvider } from "./context/BannerContext";
import { SubCategoryProvider } from "./context/SubCategoryContext";
import { SettingsProvider } from "./context/SettingsContext";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./admin/components/ProtectedRoute";

import Home from "./pages/Home";
import Women from "./pages/Women";
import WomenProducts from "./pages/WomenProducts";
import Men from "./pages/Men";
import Kids from "./pages/Kids";
import Combo from "./pages/Combo";
import NewArrivalsPage from "./pages/NewArrivalsPage";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import OrderHistory from "./pages/OrderHistory";
import OrderDetails from "./pages/OrderDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import GoogleAuthSuccess from "./pages/GoogleAuthSuccess";
import Profile from "./pages/Profile";
import Contact from "./pages/Contact";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import Products from "./admin/Products";
import AddProduct from "./admin/AddProduct";
import EditProduct from "./admin/EditProduct";
import Categories from "./admin/Categories";
import Orders from "./admin/Orders";
import Customers from "./admin/Customers";
import Reviews from "./admin/Reviews";
import Revenue from "./admin/Revenue";
import Settings from "./admin/Settings";
import BannerManager from "./admin/BannerManager";
import AddBanner from "./admin/AddBanner";
import EditBanner from "./admin/EditBanner";
import TestNotifications from "./admin/TestNotifications";

// Component to conditionally render FloatingContact
function ConditionalFloatingContact() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Don't show FloatingContact on admin pages
  if (isAdminRoute) {
    return null;
  }
  
  return <FloatingContact />;
}

export default function App() {
  // Initialize authentication on app load
  useEffect(() => {
    initAuth();
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <SettingsProvider>
          <CartProvider>
            <WishlistProvider>
              <BannerProvider>
                <SubCategoryProvider>
                  <SocketProvider>
                    <BrowserRouter
                      future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                      }}
                    >
                      {/* Conditional floating contact bar — only shows on customer pages, not admin */}
                      <ConditionalFloatingContact />
                      <Routes>
                        {/* ---------- Customer storefront ---------- */}
                        <Route element={<Layout />}>
                          <Route path="/" element={<Home />} />
                          <Route path="/women" element={<Women />} />
                          <Route path="/women/:subCategorySlug" element={<WomenProducts />} />
                          <Route path="/men" element={<Men />} />
                          <Route path="/kids" element={<Kids />} />
                          <Route path="/combo" element={<Combo />} />
                          <Route path="/new" element={<NewArrivalsPage />} />
                          <Route path="/product/:id" element={<ProductDetails />} />
                          <Route path="/wishlist" element={<Wishlist />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/checkout" element={<Checkout />} />
                          <Route path="/order-success/:bookingId" element={<OrderSuccess />} />
                          <Route path="/orders" element={<OrderHistory />} />
                          <Route path="/order-details/:bookingId" element={<OrderDetails />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />
                          <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/about" element={<About />} />
                        </Route>

                        {/* ---------- Admin dashboard (protected routes) ---------- */}
                        <Route path="/admin" element={<ProtectedRoute />}>
                          <Route element={<AdminLayout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="products" element={<Products />} />
                            <Route path="products/add" element={<AddProduct />} />
                            <Route path="products/edit/:id" element={<EditProduct />} />
                            <Route path="categories" element={<Categories />} />
                            <Route path="orders" element={<Orders />} />
                            <Route path="customers" element={<Customers />} />
                            <Route path="reviews" element={<Reviews />} />
                            <Route path="revenue" element={<Revenue />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="banners" element={<BannerManager />} />
                            <Route path="banners/add" element={<AddBanner />} />
                            <Route path="banners/edit/:id" element={<EditBanner />} />
                            <Route path="test-notifications" element={<TestNotifications />} />
                          </Route>
                        </Route>

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </BrowserRouter>
                  </SocketProvider>
                </SubCategoryProvider>
              </BannerProvider>
            </WishlistProvider>
          </CartProvider>
        </SettingsProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
