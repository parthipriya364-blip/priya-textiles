# Priya Textiles - Backend API

## Authentication System with JWT & Bcrypt

### 🚀 Features
- Unified login/signup for users and admins
- JWT token-based authentication
- Bcrypt password encryption
- Role-based access control (RBAC)
- Protected routes middleware
- User profile management
- Password update functionality

---

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection
├── controller/
│   └── authController.js     # Authentication logic
├── middleware/
│   └── auth.js               # JWT verification & authorization
├── models/
│   └── User.js               # User model with bcrypt
├── routes/
│   └── authRoutes.js         # API routes
├── utils/
│   └── jwt.js                # JWT utilities
├── .env                      # Environment variables
├── .gitignore               # Git ignore file
├── package.json             # Dependencies
├── README.md                # This file
└── server.js                # Main server file
```

---

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `POST /api/auth/logout` - Logout user (Protected)
- `PUT /api/auth/updatepassword` - Update password (Protected)
- `PUT /api/auth/updateprofile` - Update profile (Protected)

### Health Check
- `GET /api/health` - Server health status

---

## 🔐 Environment Variables

Required variables in `.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
ADMIN_SECRET=your_admin_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing
- **nodemon** - Development auto-restart

---

## 🔒 Security Features

1. **Password Encryption**: Bcrypt with 10 salt rounds
2. **JWT Tokens**: Signed tokens with 7-day expiration
3. **Protected Routes**: Middleware validation
4. **Role-Based Access**: User/Admin authorization
5. **Secure Cookies**: httpOnly, secure flags
6. **Input Validation**: Mongoose schema validation

---

## 📚 Documentation

- See `AUTHENTICATION_IMPLEMENTATION.md` for complete guide
- See `QUICK_START_GUIDE.md` for quick setup

---

## 🧪 Testing

Test with Postman, Thunder Client, or cURL:

```bash
# Health check
curl http://localhost:5000/api/health

# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

---

## 📄 License

Copyright © 2024 Priya Textiles
