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
    addToCart(product).then((added) => {
      if (added) showToast(`${product.name} added to cart`);
    });
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    const changed = toggleWishlist(product);
    if (changed) {
      showToast(
        wishlisted ? `Removed from wishlist` : `Added to wishlist`,
        wishlisted ? "error" : "success"
      );
    }
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
        
        {product.colors?.length > 0 && (
          <div className="product-card-colors" style={{ 
            display: 'flex', 
            gap: '6px', 
            marginTop: '6px',
            marginBottom: '8px'
          }}>
            {product.colors.slice(0, 5).map((color, index) => {
              const colorMap = {
                'red': '#DC143C',
                'pink': '#FF69B4',
                'orange': '#FF8C00',
                'yellow': '#FFD700',
                'green': '#0b6e4f',
                'blue': '#1e5eff',
                'purple': '#8B008B',
                'brown': '#8B4513',
                'black': '#111111',
                'white': '#FFFFFF',
                'gray': '#808080',
                'grey': '#808080',
                'beige': '#F5F5DC',
                'gold': '#d4af37',
                'silver': '#C0C0C0',
                'maroon': '#6d001a',
                'navy': '#000080',
                'teal': '#008080',
                'olive': '#808000',
              };
              
              const colorLower = color.toLowerCase().trim();
              const colorValue = colorMap[colorLower] || '#cccccc';
              const isLightColor = ['white', 'beige', 'yellow', 'silver'].includes(colorLower);
              
              return (
                <div
                  key={index}
                  title={color}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: colorValue,
                    border: isLightColor ? '1.5px solid #ddd' : 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              );
            })}
            {product.colors.length > 5 && (
              <span style={{ 
                fontSize: '11px', 
                color: '#666', 
                alignSelf: 'center',
                marginLeft: '2px'
              }}>
                +{product.colors.length - 5}
              </span>
            )}
          </div>
        )}
        
        <div className="product-card-price">
          <span className="price">{formatPrice(product.price)}</span>
          {product.oldPrice && <span className="old-price">{formatPrice(product.oldPrice)}</span>}
        </div>
      </div>
    </Link>
  );
}
