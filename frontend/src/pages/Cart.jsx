import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaTrashAlt, FaShoppingBag, FaArrowRight } from "react-icons/fa";
import PageHeader from "../components/PageHeader";
import QuantitySelector from "../components/QuantitySelector";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { getPublicSettings } from "../services/settingsService";
import { formatPrice } from "../utils/formatPrice";
import "./style/Cart.css";

export default function Cart() {
  const { items, removeFromCart, updateQty, subtotal, savings } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
    }
  }, [user, navigate, location.pathname]);

  // Shipping configuration from admin settings
  const [shippingConfig, setShippingConfig] = useState({
    shippingCharge: 149,
    freeShippingThreshold: 2999,
  });

  useEffect(() => {
    // Fetch shipping configuration from admin settings
    const fetchShippingConfig = async () => {
      try {
        const response = await getPublicSettings();
        if (response.success && response.settings) {
          setShippingConfig({
            shippingCharge: response.settings.shippingCharge || 149,
            freeShippingThreshold: response.settings.freeShippingThreshold || 2999,
          });
        }
      } catch (error) {
        console.error('Failed to fetch shipping config:', error);
        // Use default values if fetch fails
      }
    };

    fetchShippingConfig();
  }, []);

  if (!user) return null;

  const shipping = subtotal >= shippingConfig.freeShippingThreshold || subtotal === 0 ? 0 : shippingConfig.shippingCharge;
  const total = subtotal + shipping;

  return (
    <div className="page-enter">
      <PageHeader eyebrow="Review Your Order" title="Shopping Cart" crumbs={[{ label: "Cart" }]} />

      <section className="section">
        <div className="container">
          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><FaShoppingBag /></div>
              <h3>Your cart is empty</h3>
              <p>Browse our collections and add pieces you love.</p>
              <Link to="/women" className="btn btn-primary">Continue Shopping</Link>
            </div>
          ) : (
            <div className="cart-grid">
              <div className="cart-items">
                {items.map((item) => (
                  <div className="cart-row" key={item.lineId}>
                    <img src={item.image} alt={item.name} />
                    <div className="cart-row-info">
                      <h3>{item.name}</h3>
                      <span className="cart-row-size">Size: {item.size}</span>
                      <div className="product-card-price">
                        <span className="price">{formatPrice(item.price)}</span>
                        {item.oldPrice && <span className="old-price">{formatPrice(item.oldPrice)}</span>}
                      </div>
                    </div>
                    <QuantitySelector qty={item.qty} onChange={(qty) => updateQty(item.lineId, qty)} />
                    <span className="cart-row-total">{formatPrice(item.price * item.qty)}</span>
                    <button
                      className="cart-row-remove"
                      onClick={() => {
                        removeFromCart(item.lineId);
                        showToast("Removed from cart", "error");
                      }}
                      aria-label={`Remove ${item.name}`}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                ))}
              </div>

              <aside className="cart-summary">
                <h3>Order Summary</h3>
                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {savings > 0 && (
                  <div className="cart-summary-row cart-savings">
                    <span>You Save</span>
                    <span>-{formatPrice(savings)}</span>
                  </div>
                )}
                <div className="cart-summary-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div className="cart-summary-row cart-total">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <button className="btn btn-primary btn-block" onClick={() => navigate("/checkout")}>
                  Proceed to Checkout <FaArrowRight />
                </button>
                <Link to="/women" className="cart-continue">Continue Shopping</Link>
              </aside>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
