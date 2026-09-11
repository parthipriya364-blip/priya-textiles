const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { sendBookingConfirmation, sendOrderStatusUpdate, sendAdminOrderNotification } = require('../utils/emailService');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    console.log('📝 Creating Razorpay order...');
    console.log('   Amount: ₹', amount);
    console.log('   Currency:', currency);

    if (!amount || amount <= 0) {
      console.error('❌ Invalid amount:', amount);
      return res.status(400).json({
        success: false,
        message: 'Invalid amount',
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Amount in paise (convert to integer)
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
    };

    const razorpayOrder = await razorpay.orders.create(options);

    console.log('✅ Razorpay order created successfully');
    console.log('   Order ID:', razorpayOrder.id);
    console.log('   Amount:', razorpayOrder.amount, 'paise');

    res.status(200).json({
      success: true,
      order: razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('❌ Create Razorpay order error:', error);
    console.error('   Error message:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay order',
      error: error.message,
    });
  }
};

// @desc    Verify Razorpay payment and create booking
// @route   POST /api/payments/verify-and-book
// @access  Private
exports.verifyAndCreateBooking = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingData,
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment details are required',
      });
    }

    if (!bookingData) {
      return res.status(400).json({
        success: false,
        message: 'Booking data is required',
      });
    }

    // Verify Razorpay signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    // Payment verified successfully, create booking
    const { items, customer, subtotal, shipping, total, paymentMethod } = bookingData;

    // Validate products and stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.name} not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }
    }

    // Create booking
    const booking = await Booking.create({
      user: req.user ? req.user.id : null,
      items,
      customer,
      subtotal,
      shipping,
      total,
      paymentMethod,
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    // Update product stock
    for (const item of items) {
      const updatedProduct = await Product.findByIdAndUpdate(
        item.product, 
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      // Check for low stock and emit notification
      const LOW_STOCK_THRESHOLD = 10;
      if (updatedProduct && updatedProduct.stock <= LOW_STOCK_THRESHOLD && updatedProduct.stock > 0) {
        const io = req.app.get('io');
        if (io) {
          io.to('admin-room').emit('low-stock-alert', {
            productId: updatedProduct._id,
            productName: updatedProduct.name,
            stock: updatedProduct.stock,
            threshold: LOW_STOCK_THRESHOLD,
          });
          console.log(`⚠️  Low stock alert emitted for: ${updatedProduct.name} (${updatedProduct.stock} left)`);
        }
      }
    }

    // Clear user's cart if logged in
    if (req.user) {
      await Cart.findOneAndUpdate(
        { user: req.user.id },
        { items: [] }
      );
    }

    // Populate booking details
    await booking.populate('items.product', 'name slug image category');
    if (booking.user) {
      await booking.populate('user', 'name email');
    }

    // Send confirmation email
    sendBookingConfirmation(booking).catch(err => 
      console.error('Email notification failed:', err.message)
    );

    // Send admin notification email
    sendAdminOrderNotification(booking).catch(err =>
      console.error('Admin notification email failed:', err.message)
    );

    // Emit Socket.IO event for real-time notification
    const io = req.app.get('io');
    if (io) {
      // Emit to admin room
      io.to('admin-room').emit('new-order', {
        orderId: booking._id,
        customerName: customer.name,
        customerEmail: customer.email,
        amount: total,
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        itemCount: items.length,
        timestamp: booking.createdAt,
      });

      // Emit to user's room if logged in
      if (req.user) {
        io.to(`user-${req.user.id}`).emit('order-confirmed', {
          orderId: booking._id,
          message: 'Your order has been confirmed',
          amount: total,
        });
      }

      console.log('📡 Socket.IO: New order notification emitted');
    }

    res.status(201).json({
      success: true,
      message: 'Payment verified and booking confirmed',
      booking,
    });
  } catch (error) {
    console.error('Verify and create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification or booking creation failed',
      error: error.message,
    });
  }
};

// @desc    Create COD booking
// @route   POST /api/payments/cod-booking
// @access  Public
exports.createCODBooking = async (req, res) => {
  try {
    const { items, customer, subtotal, shipping, total, paymentMethod } = req.body;

    console.log('💰 Creating COD booking...');
    console.log('   User ID:', req.user ? req.user.id : 'Guest');
    console.log('   Customer:', customer.name, customer.email);

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in booking',
      });
    }

    if (!customer || !customer.name || !customer.email || !customer.phone || !customer.address) {
      return res.status(400).json({
        success: false,
        message: 'Complete customer information is required',
      });
    }

    if (paymentMethod !== 'cod') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method for COD booking',
      });
    }

    // Validate products and stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.name} not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }
    }

    // Create booking (with user ID if authenticated)
    const booking = await Booking.create({
      user: req.user ? req.user.id : null,
      items,
      customer,
      subtotal,
      shipping,
      total,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'confirmed',
    });

    console.log('✅ COD booking created:', booking._id);
    console.log('   Associated with user:', booking.user || 'No user (Guest)');

    // Update product stock
    for (const item of items) {
      const updatedProduct = await Product.findByIdAndUpdate(
        item.product, 
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      // Check for low stock and emit notification
      const LOW_STOCK_THRESHOLD = 10;
      if (updatedProduct && updatedProduct.stock <= LOW_STOCK_THRESHOLD && updatedProduct.stock > 0) {
        const io = req.app.get('io');
        if (io) {
          io.to('admin-room').emit('low-stock-alert', {
            productId: updatedProduct._id,
            productName: updatedProduct.name,
            stock: updatedProduct.stock,
            threshold: LOW_STOCK_THRESHOLD,
          });
          console.log(`⚠️  Low stock alert emitted for: ${updatedProduct.name} (${updatedProduct.stock} left)`);
        }
      }
    }

    // Clear user's cart if logged in
    if (req.user) {
      await Cart.findOneAndUpdate(
        { user: req.user.id },
        { items: [] }
      );
    }

    // Populate booking details
    await booking.populate('items.product', 'name slug image category');
    if (booking.user) {
      await booking.populate('user', 'name email');
    }

    // Send confirmation email
    sendBookingConfirmation(booking).catch(err => 
      console.error('Email notification failed:', err.message)
    );

    // Send admin notification email
    sendAdminOrderNotification(booking).catch(err =>
      console.error('Admin notification email failed:', err.message)
    );

    // Emit Socket.IO event for real-time notification
    const io = req.app.get('io');
    if (io) {
      // Emit to admin room
      io.to('admin-room').emit('new-order', {
        orderId: booking._id,
        customerName: customer.name,
        customerEmail: customer.email,
        amount: total,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        itemCount: items.length,
        timestamp: booking.createdAt,
      });

      // Emit payment received notification to admin
      io.to('admin-room').emit('payment-received', {
        orderId: booking._id,
        amount: total,
        paymentMethod: 'cod',
      });

      // Emit to user's room if logged in
      if (req.user) {
        io.to(`user-${req.user.id}`).emit('order-confirmed', {
          orderId: booking._id,
          message: 'Your COD order has been confirmed',
          amount: total,
        });
      }

      console.log('📡 Socket.IO: COD order notification emitted');
    }

    res.status(201).json({
      success: true,
      message: 'COD booking confirmed',
      booking,
    });
  } catch (error) {
    console.error('❌ Create COD booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create COD booking',
      error: error.message,
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/payments/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    console.log('📦 Fetching bookings for user:', req.user.id);
    
    const bookings = await Booking.find({ user: req.user.id })
      .populate('items.product', 'name slug image')
      .sort({ createdAt: -1 });

    console.log('✅ Found', bookings.length, 'bookings for user:', req.user.id);
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('❌ Get my bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
    });
  }
};

// @desc    Get single booking
// @route   GET /api/payments/booking/:id
// @access  Private/Public
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('items.product', 'name slug image category')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if user owns this booking or is admin
    if (req.user) {
      if (booking.user && booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this booking',
        });
      }
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
    });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/payments/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name slug image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      bookings,
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
    });
  }
};

// @desc    Update booking status (Admin)
// @route   PUT /api/payments/booking/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    // Validate status values (must match Booking model enum)
    const validOrderStatuses = ['confirmed', 'shipped', 'out-for-delivery', 'delivered', 'cancelled'];
    const validPaymentStatuses = ['pending', 'paid', 'failed'];

    if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Must be one of: ${validOrderStatuses.join(', ')}`,
      });
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}`,
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Store old status for email notification
    const oldOrderStatus = booking.orderStatus;

    // Update booking fields directly
    if (orderStatus) booking.orderStatus = orderStatus;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    // Save the booking
    await booking.save();

    // Populate after save
    await booking.populate('user', 'name email phone');
    await booking.populate('items.product', 'name slug image');

    // Emit Socket.IO event for real-time update
    const io = req.app.get('io');
    if (io) {
      // Emit to specific user
      if (booking.user) {
        io.to(`user-${booking.user._id}`).emit('order-status-updated', {
          orderId: booking._id,
          orderStatus: booking.orderStatus,
          paymentStatus: booking.paymentStatus,
          message: `Your order status has been updated to: ${booking.orderStatus}`,
        });
      }

      // Emit to specific order room
      io.to(`order-${booking._id}`).emit('order-status-updated', {
        orderId: booking._id,
        orderStatus: booking.orderStatus,
        paymentStatus: booking.paymentStatus,
      });

      // Emit to admin room
      io.to('admin-room').emit('order-updated', {
        orderId: booking._id,
        orderStatus: booking.orderStatus,
        paymentStatus: booking.paymentStatus,
        user: booking.user?.name || 'Guest',
      });

      console.log('📡 Socket.IO: Order status update emitted for order:', booking._id);
    }

    // Send status update email if order status changed
    if (orderStatus && orderStatus !== oldOrderStatus) {
      sendOrderStatusUpdate(booking, oldOrderStatus).catch(err =>
        console.error('Email notification failed:', err.message)
      );
    }

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      booking: booking,
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update booking',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/payments/booking/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if user owns this booking
    if (booking.user && booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    // Check if booking can be cancelled
    if (booking.orderStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled',
      });
    }

    // Restore product stock
    for (const item of booking.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    booking.orderStatus = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
    });
  }
};

// @desc    Get Razorpay Key
// @route   GET /api/payments/razorpay-key
// @access  Public
exports.getRazorpayKey = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Get Razorpay key error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Razorpay key',
    });
  }
};
