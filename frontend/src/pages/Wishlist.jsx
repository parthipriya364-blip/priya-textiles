import { Link } from "react-router-dom";
import { FaHeartBroken, FaShoppingBag, FaTrashAlt } from "react-icons/fa";
import PageHeader from "../components/PageHeader";
import StarRating from "../components/StarRating";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { formatPrice } from "../utils/formatPrice";
import "./style/Wishlist.css";

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  return (
    <div className="page-enter">
      <PageHeader eyebrow="Saved for Later" title="My Wishlist" crumbs={[{ label: "Wishlist" }]} />

      <section className="section">
        <div className="container">
          {wishlist.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><FaHeartBroken /></div>
              <h3>Your wishlist is empty</h3>
              <p>Save pieces you love and come back to them anytime.</p>
              <Link to="/women" className="btn btn-primary">Explore Collections</Link>
            </div>
          ) : (
            <div className="wishlist-list">
              {wishlist.map((product) => (
                <div className="wishlist-row" key={product._id || product.id}>
                  <Link to={`/product/${product._id || product.id}`} className="wishlist-img">
                    <img src={product.image?.url || product.image} alt={product.name} />
                  </Link>
                  <div className="wishlist-info">
                    <Link to={`/product/${product._id || product.id}`}><h3>{product.name}</h3></Link>
                    <span className="product-card-cat">{product.type || product.categoryName}</span>
                    <StarRating rating={product.rating} reviews={product.reviewsCount || product.reviews} />
                    <div className="product-card-price">
                      <span className="price">{formatPrice(product.price)}</span>
                      {product.oldPrice && <span className="old-price">{formatPrice(product.oldPrice)}</span>}
                    </div>
                  </div>
                  <div className="wishlist-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        addToCart(product);
                        showToast(`${product.name} added to cart`);
                      }}
                    >
                      <FaShoppingBag /> Add to Cart
                    </button>
                    <button
                      className="wishlist-remove"
                      onClick={() => {
                        removeFromWishlist(product._id || product.id);
                        showToast("Removed from wishlist", "error");
                      }}
                      aria-label="Remove from wishlist"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
