const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const mongoose = require('mongoose');
const http = require('http');
const socketIO = require('socket.io');
const User = require('./models/User');

// Load env vars FIRST before importing passport
dotenv.config();

// Now import passport after env vars are loaded
const passport = require('./config/passport');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Make io accessible to routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('👤 Client connected:', socket.id);

  // User joins their personal room (for receiving order updates)
  socket.on('join-user-room', (userId) => {
    if (userId) {
      socket.join(`user-${userId}`);
      console.log(`✅ User ${userId} joined their room`);
    }
  });

  // Admin joins admin room (for monitoring all orders)
  socket.on('join-admin-room', () => {
    socket.join('admin-room');
    console.log('✅ Admin joined admin room');
  });

  // Join specific order room
  socket.on('join-order-room', (orderId) => {
    if (orderId) {
      socket.join(`order-${orderId}`);
      console.log(`✅ Joined order room: ${orderId}`);
    }
  });

  // Leave order room
  socket.on('leave-order-room', (orderId) => {
    if (orderId) {
      socket.leave(`order-${orderId}`);
      console.log(`👋 Left order room: ${orderId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('👋 Client disconnected:', socket.id);
  });
});

console.log('✅ Socket.IO initialized');

// Connect to MongoDB - Database connection code integrated directly
const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📍 URI:', process.env.MONGO_URI?.replace(/:[^:]*@/, ':****@')); // Hide password
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📚 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Connection event handlers
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('connected', () => {
  console.log('🔗 MongoDB connection established');
});

// Create default admin if credentials are provided in .env
const ensureDefaultAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('⚠️  ADMIN_EMAIL and ADMIN_PASSWORD not set in .env');
    console.log('💡 Create admin via API: POST /api/auth/signup with adminSecret');
    return;
  }

  const existingAdmin = await User.findOne({ email: email.toLowerCase() });
  if (existingAdmin) {
    if (existingAdmin.role !== 'admin') {
      existingAdmin.role = 'admin';
      await existingAdmin.save({ validateBeforeSave: false });
      console.log(`✅ Updated ${email} to admin role`);
    } else {
      console.log(`✅ Admin already exists: ${email}`);
    }
    return;
  }

  await User.create({
    name: 'Administrator',
    email,
    password,
    role: 'admin'
  });
  console.log(`✅ Default admin created: ${email}`);
};

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// Session middleware (required for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_session_secret_change_this',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// CORS middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/subcategories', require('./routes/subCategoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    googleOAuth: process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not Configured'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

// Start server with database connection
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Create default admin if configured
    await ensureDefaultAdmin();
    
    // Start Express server with Socket.IO
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
      console.log(`🔌 Socket.IO: Enabled`);
      console.log(`💚 Health: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? '✅ Enabled' : '❌ Disabled (configure in .env)'}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Stop the existing server or set a different PORT in .env.`);
      } else {
        console.error(`❌ Server failed to start: ${error.message}`);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error(`❌ Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

// Start the server
startServer();
