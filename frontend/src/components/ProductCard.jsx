import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaShoppingBag, FaEye } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import StarRating from "./StarRating";
import { formatPrice, discountPercent } from "../utils/formatPrice";
import "./style/ProductCard.css";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const productId = product._id || product.id;
  const wishlisted = isWishlisted(productId);
  const discount = discountPercent(product.price, product.oldPrice);
  const productImage = product.image?.url || product.image;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!product.inStock || product.stock === 0) {
      showToast('Product is out of stock', 'error');
      return;
    }
    addToCart(product);
    showToast(`${product.name} added to cart`);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
    showToast(
      wishlisted ? `Removed from wishlist` : `Added to wishlist`,
      wishlisted ? "error" : "success"
    );
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    navigate(`/product/${productId}`);
  };

  return (
    <Link to={`/product/${productId}`} className="product-card">
      <div className="product-card-media">
        <img src={productImage} alt={product.name} />
        <div className="product-card-badges">
          {product.isNew && <span className="badge badge-new">New</span>}
          {product.isFeatured && <span className="badge badge-featured">Featured</span>}
          {discount > 0 && <span className="badge badge-sale">-{discount}%</span>}
          {(!product.inStock || product.stock === 0) && <span className="badge badge-outofstock">Out of Stock</span>}
        </div>

        <button
          type="button"
          className={`product-card-wish ${wishlisted ? "is-active" : ""}`}
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {wishlisted ? <FaHeart /> : <FaRegHeart />}
        </button>

        <div className="product-card-actions">
          <button 
            type="button" 
            onClick={handleAddToCart}
            disabled={!product.inStock || product.stock === 0}
          >
            <FaShoppingBag /> {(!product.inStock || product.stock === 0) ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <button type="button" className="icon-only" onClick={handleQuickView} aria-label="Quick view">
            <FaEye />
          </button>
        </div>
      </div>

      <div className="product-card-body">
        <span className="product-card-cat">{product.type || product.categoryName}</span>
        <h3>{product.name}</h3>
        <StarRating rating={product.rating || 0} reviews={product.reviewsCount || 0} />
        <div className="product-card-price">
          <span className="price">{formatPrice(product.price)}</span>
          {product.oldPrice && <span className="old-price">{formatPrice(product.oldPrice)}</span>}
        </div>
      </div>
    </Link>
  );
}
