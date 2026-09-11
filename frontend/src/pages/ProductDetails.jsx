import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaShoppingBag, FaBolt, FaTruck, FaUndoAlt, FaShieldAlt, FaStar, FaStarHalfAlt, FaRegStar, FaCheckCircle } from "react-icons/fa";
import { getProduct, getProducts } from "../services/productService";
import { getProductReviews } from "../services/reviewService";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import StarRating from "../components/StarRating";
import QuantitySelector from "../components/QuantitySelector";
import ProductGrid from "../components/ProductGrid";
import Loader from "../components/Loader";
import { formatPrice, discountPercent } from "../utils/formatPrice";
import "./style/ProductDetails.css";

const TABS = ["Description", "Fabric & Care", "Reviews"];
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState(TABS[0]);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (product && tab === "Reviews") {
      loadReviews();
    }
  }, [product, tab]);

  const loadProduct = async () => {
    if (!objectIdPattern.test(id)) {
      setProduct(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getProduct(id);
      setProduct(data.product);
      
      // Set default size
      if (data.product.sizes?.length > 0) {
        setSize(data.product.sizes[0]);
      }

      // Load related products (same category)
      if (data.product.categoryName) {
        const relatedData = await getProducts({ 
          category: data.product.categoryName.toLowerCase() 
        });
        const filtered = (relatedData.products || [])
          .filter(p => p._id !== data.product._id)
          .slice(0, 4);
        setRelatedProducts(filtered);
      }

      setActiveImage(0);
      setQty(1);
      setSizeError(false);
      setTab(TABS[0]);
    } catch (error) {
      console.error('Failed to load product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const data = await getProductReviews(id);
      setReviews(data.reviews || []);
      setAvgRating(parseFloat(data.avgRating) || 0);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="star filled" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="star half" />);
      } else {
        stars.push(<FaRegStar key={i} className="star empty" />);
      }
    }
    return stars;
  };

  const formatReviewDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) return <Loader label="Loading product" />;

  if (!product) {
    return (
      <div className="empty-state page-enter">
        <h3>Product Not Found</h3>
        <p>The piece you're looking for may have sold out or moved.</p>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  const productId = product._id || product.id;
  const wishlisted = isWishlisted(productId);
  const discount = discountPercent(product.price, product.oldPrice);
  
  // Prepare gallery images
  const gallery = [];
  if (product.image?.url) gallery.push(product.image.url);
  if (product.gallery) {
    product.gallery.forEach(img => {
      if (img.url) gallery.push(img.url);
    });
  }

  const handleAddToCart = () => {
    if (product.sizes?.length && !size) {
      setSizeError(true);
      return;
    }
    if (!product.inStock || product.stock === 0) {
      showToast('Product is out of stock', 'error');
      return;
    }
    addToCart(product, size, qty).then((added) => {
      if (added) showToast(`${qty} × ${product.name} added to cart`);
    });
  };

  const handleBuyNow = () => {
    if (product.sizes?.length && !size) {
      setSizeError(true);
      return;
    }
    if (!product.inStock || product.stock === 0) {
      showToast('Product is out of stock', 'error');
      return;
    }
    addToCart(product, size, qty).then((added) => {
      if (added) navigate("/cart");
    });
  };

  return (
    <div className="page-enter product-details">
      <div className="container">
        <nav className="breadcrumb pd-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="sep">/</span>
          <Link to={`/${product.categoryName?.toLowerCase() || 'shop'}`}>
            {product.categoryName || 'Shop'}
          </Link>
          <span className="sep">/</span>
          <span className="current">{product.name}</span>
        </nav>

        <div className="pd-grid">
          <div className="pd-gallery">
            <div className="pd-gallery-main">
              {product.isNew && <span className="badge badge-new pd-badge">New</span>}
              {product.isFeatured && <span className="badge badge-featured pd-badge">Featured</span>}
              {discount > 0 && <span className="badge badge-sale pd-badge pd-badge-2">-{discount}%</span>}
              {(!product.inStock || product.stock === 0) && (
                <span className="badge badge-outofstock pd-badge pd-badge-3">Out of Stock</span>
              )}
              <img src={gallery[activeImage] || product.image?.url} alt={product.name} />
            </div>
            {gallery.length > 1 && (
              <div className="pd-thumbs">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    className={i === activeImage ? "active" : ""}
                    onClick={() => setActiveImage(i)}
                    aria-label={`Show image ${i + 1}`}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pd-info">
            <span className="product-card-cat">
              {product.type && `${product.type} · `}
              {product.fabric || product.categoryName}
            </span>
            <h1>{product.name}</h1>
            <StarRating rating={product.rating || 0} reviews={product.reviewsCount || 0} size={15} />

            <div className="pd-price">
              <span className="price">{formatPrice(product.price)}</span>
              {product.oldPrice && <span className="old-price">{formatPrice(product.oldPrice)}</span>}
              {discount > 0 && <span className="pd-discount">Save {discount}%</span>}
            </div>

            {product.stock !== undefined && (
              <p className="pd-stock" style={{ 
                color: product.stock === 0 ? 'var(--c-maroon-deep)' : product.stock <= 5 ? 'var(--c-gold-deep)' : 'var(--c-green)' 
              }}>
                {product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? `Only ${product.stock} left in stock!` : 'In Stock'}
              </p>
            )}

            <p className="pd-desc">{product.description}</p>

            {product.colors?.length > 0 && (
              <div className="pd-block">
                <span className="pd-block-label">Colour</span>
                <div className="pd-colors">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      className="pd-color-circle"
                      title={color}
                      style={{
                        background:
                          color.toLowerCase() === "maroon"
                            ? "#6d001a"
                            : color.toLowerCase() === "gold"
                            ? "#d4af37"
                            : color.toLowerCase() === "green"
                            ? "#0b6e4f"
                            : color.toLowerCase() === "blue"
                            ? "#1e5eff"
                            : color.toLowerCase() === "black"
                            ? "#111"
                            : "#ccc",
                      }}
                    ></button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes?.length > 0 && (
              <div className="pd-block">
                <span className="pd-block-label">Size {sizeError && <em>— please select a size</em>}</span>
                <div className="pd-sizes">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      className={size === s ? "active" : ""}
                      onClick={() => { setSize(s); setSizeError(false); }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pd-block">
              <span className="pd-block-label">Quantity</span>
              <QuantitySelector 
                qty={qty} 
                onChange={setQty} 
                max={product.stock || 99}
              />
            </div>

            <div className="pd-actions">
              <button 
                className="btn btn-primary" 
                onClick={handleAddToCart}
                disabled={!product.inStock || product.stock === 0}
              >
                <FaShoppingBag /> {(!product.inStock || product.stock === 0) ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button 
                className="btn btn-gold" 
                onClick={handleBuyNow}
                disabled={!product.inStock || product.stock === 0}
              >
                <FaBolt /> Buy Now
              </button>
              <button
                className={`pd-wish ${wishlisted ? "is-active" : ""}`}
                onClick={() => {
                  const changed = toggleWishlist(product);
                  if (changed) {
                    showToast(wishlisted ? "Removed from wishlist" : "Added to wishlist", wishlisted ? "error" : "success");
                  }
                }}
                aria-label="Toggle wishlist"
              >
                {wishlisted ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>

            <div className="pd-perks">
              <span>
                <FaTruck />
                Free Shipping on orders above ₹2,999
              </span>
              <span>
                <FaUndoAlt />
                Damaged Product Return Only
                <br />
                Parcel opening video is mandatory.
              </span>
              <span>
                <FaShieldAlt />
                100% Secure Online Payment
              </span>
              <span>
                ⭐ Premium Quality Guaranteed
              </span>
            </div>
          </div>
        </div>

        <div className="pd-tabs-section">
          <div className="pd-tabs">
            {TABS.map((t) => (
              <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>
          <div className="pd-tab-content">
            {tab === "Description" && <p>{product.description}</p>}
            {tab === "Fabric & Care" && (
              <ul className="pd-care-list">
                {product.fabric && <li>Fabric: {product.fabric}</li>}
                <li>Dry clean recommended for silk and velvet pieces.</li>
                <li>Store folded in muslin cloth away from direct sunlight.</li>
                <li>Iron on low heat with a protective cloth over embroidery.</li>
              </ul>
            )}
            {tab === "Reviews" && (
              <div className="pd-reviews">
                {reviewsLoading ? (
                  <div className="reviews-loading">
                    <div className="loader-spinner"></div>
                    <p>Loading reviews...</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="reviews-empty">
                    <FaStar className="empty-icon" />
                    <h3>No Reviews Yet</h3>
                    <p>Be the first to review this product after purchasing it!</p>
                  </div>
                ) : (
                  <>
                    <div className="reviews-summary">
                      <div className="reviews-rating-overview">
                        <div className="rating-large">
                          <span className="rating-number">{avgRating.toFixed(1)}</span>
                          <div className="rating-stars-large">
                            {renderStars(avgRating)}
                          </div>
                          <p className="rating-count">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </div>

                    <div className="reviews-list">
                      <h3>Customer Reviews</h3>
                      {reviews.map((review) => (
                        <div key={review._id} className="review-item">
                          <div className="review-header">
                            <div className="review-user">
                              <div className="review-avatar">
                                {review.customerName?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div className="review-user-info">
                                <div className="review-user-name">
                                  {review.customerName}
                                  <span className="verified-badge">
                                    <FaCheckCircle /> Verified Buyer
                                  </span>
                                </div>
                                <div className="review-meta">
                                  <span className="review-date">{formatReviewDate(review.createdAt)}</span>
                                  {review.orderDate && (
                                    <span className="review-purchase">
                                      · Purchased on {new Date(review.orderDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="review-rating">
                              {renderStars(review.rating)}
                              <span className="rating-text">{review.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="review-content">
                            <p>{review.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="pd-related">
            <div className="section-title align-left">
              <span className="eyebrow">You May Also Like</span>
              <h2>Complete the Look</h2>
            </div>
            <ProductGrid products={relatedProducts} columns={4} />
          </div>
        )}
      </div>
    </div>
  );
}
