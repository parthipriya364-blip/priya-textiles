const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Product = require('../models/Product');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { bookingId, productId, rating, comment } = req.body;

    // Validate required fields
    if (!bookingId || !productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Check if booking exists and belongs to user
    const booking = await Booking.findById(bookingId).populate('user');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if user owns this booking
    if (booking.user && booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this order',
      });
    }

    // Check if order is delivered
    if (booking.orderStatus !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Can only review delivered orders',
      });
    }

    // Check if product exists in the booking
    const productInBooking = booking.items.find(
      item => item.product.toString() === productId
    );

    if (!productInBooking) {
      return res.status(400).json({
        success: false,
        message: 'Product not found in this order',
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ 
      booking: bookingId, 
      product: productId 
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }

    // Create review
    const review = await Review.create({
      user: req.user.id,
      booking: bookingId,
      product: productId,
      rating,
      comment,
      customerName: booking.customer.name,
      orderDate: booking.createdAt,
    });

    // Populate review details
    await review.populate('user', 'name email');
    await review.populate('product', 'name slug image');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message,
    });
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, productId } = req.query;

    const query = {};
    if (productId) query.product = productId;

    const reviews = await Review.find(query)
      .populate('user', 'name email')
      .populate('product', 'name slug image')
      .populate('booking', 'orderStatus')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      reviews,
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
    });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    res.status(200).json({
      success: true,
      count: reviews.length,
      avgRating: avgRating.toFixed(1),
      reviews,
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product reviews',
    });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('product', 'name slug image')
      .populate('booking', 'orderStatus')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your reviews',
    });
  }
};

// @desc    Check if user can review products in a booking
// @route   GET /api/reviews/can-review/:bookingId
// @access  Private
exports.canReviewBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('items.product', 'name image');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if user owns this booking
    if (booking.user && booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Check if order is delivered
    if (booking.orderStatus !== 'delivered') {
      return res.status(200).json({
        success: true,
        canReview: false,
        message: 'Order must be delivered to leave reviews',
        products: [],
      });
    }

    // Get existing reviews for this booking
    const existingReviews = await Review.find({ booking: req.params.bookingId });
    const reviewedProductIds = existingReviews.map(r => r.product.toString());

    // Get products that can be reviewed
    const productsToReview = booking.items
      .filter(item => !reviewedProductIds.includes(item.product._id.toString()))
      .map(item => ({
        productId: item.product._id,
        name: item.name,
        image: item.image,
      }));

    res.status(200).json({
      success: true,
      canReview: productsToReview.length > 0,
      products: productsToReview,
      reviewedProducts: existingReviews.length,
      totalProducts: booking.items.length,
    });
  } catch (error) {
    console.error('Can review booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check review status',
    });
  }
};

// @desc    Delete review (Admin)
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
    });
  }
};
