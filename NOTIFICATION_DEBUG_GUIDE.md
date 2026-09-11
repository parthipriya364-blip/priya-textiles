# 🔧 Notification Troubleshooting Guide

## Problem: Admin not receiving notifications when users place orders

This guide will help you debug and fix the Socket.IO notification system.

---

## 🎯 Step-by-Step Debugging Process

### Step 1: Check Backend Server

**1. Restart Backend Server**
```bash
cd backend
npm run dev
```

**2. Look for these console logs:**
```
✅ Socket.IO initialized
🚀 Server running on port 5000
```

**3. When a client connects, you should see:**
```
👤 Client connected: [socket-id]
✅ Admin joined admin room
```

---

### Step 2: Check Frontend Connection

**1. Open Admin Dashboard**
- Navigate to: `http://localhost:5173/admin/dashboard`
- Open Browser Console (F12)

**2. Look for these console logs:**
```
🔌 Connecting to Socket.IO server: http://localhost:5000
✅ Socket connected: [socket-id]
👤 Current user: { role: 'admin', ... }
🔧 Admin user - Joining admin room
```

**3. Check for errors:**
- ❌ Connection errors mean wrong URL or CORS issue
- ⚠️ "No user found" means authentication issue

---

### Step 3: Use the Test Page

**1. Navigate to Test Page:**
```
http://localhost:5173/admin/test-notifications
```

**2. Check Connection Status:**
- Should show: ✅ Connected (green)
- Socket ID should be displayed

**3. Send Test Notification:**
- Click "📦 New Order" button
- Check if notification appears in navbar bell icon
- Check browser console for logs

**Expected Console Output:**
```
📦 New order received: { orderId: "...", amount: 5000, ... }
```

---

### Step 4: Test Real Order Flow

**1. Open Two Browser Windows:**
- Window 1: Admin Dashboard (`/admin/dashboard`)
- Window 2: Customer Checkout (`/checkout`)

**2. In Window 2 (Customer):**
- Add products to cart
- Go to checkout
- Complete order (COD or test payment)

**3. In Window 1 (Admin):**
- Watch the notification bell
- Check browser console
- Should see notification instantly

**4. Check Backend Console:**
- Should show:
```
📡 Socket.IO: New order notification emitted
📡 Socket.IO: COD order notification emitted
```

---

## 🐛 Common Issues & Fixes

### Issue 1: Socket Not Connecting

**Symptoms:**
- Connection status shows ❌ Disconnected
- Console error: "Connection refused" or "Failed to load resource"

**Solutions:**

1. **Check Backend is Running:**
   ```bash
   # In backend folder
   npm run dev
   ```

2. **Check Port Number:**
   - Backend should be on port 5000
   - Frontend should be on port 5173

3. **Check .env Files:**

   **Frontend: `frontend/src/.env`**
   ```env
   VITE_SOCKET_URL=http://localhost:5000
   VITE_API_URL=http://localhost:5000/api
   ```

   **Backend: `backend/.env`**
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```

4. **Restart Both Servers:**
   ```bash
   # Kill all node processes
   # Windows PowerShell:
   taskkill /F /IM node.exe

   # Then restart:
   cd backend && npm run dev
   cd frontend && npm run dev
   ```

---

### Issue 2: Admin Not Joining Room

**Symptoms:**
- Console shows "No user found - not joining any rooms"
- Connected but no notifications received

**Solutions:**

1. **Check Admin is Logged In:**
   - Go to `/admin/dashboard`
   - If redirected to login, sign in first

2. **Check User Role:**
   - Open Console
   - Type: `JSON.parse(localStorage.getItem('user'))`
   - Should show: `{ role: 'admin', ... }`

3. **Fix User Role in Database:**
   ```javascript
   // In MongoDB or your database
   // Update user role to 'admin'
   db.users.updateOne(
     { email: "your-admin@email.com" },
     { $set: { role: "admin" } }
   )
   ```

4. **Check Backend Logs:**
   - Should show: `✅ Admin joined admin room`
   - If not, admin-room event not being emitted

---

### Issue 3: Events Not Received

**Symptoms:**
- Socket connected
- Admin joined room
- But notifications not appearing

**Solutions:**

1. **Check Event Names Match:**
   
   **Backend emits:**
   ```javascript
   io.to('admin-room').emit('new-order', { ... })
   ```
   
   **Frontend listens:**
   ```javascript
   socket.on('new-order', (data) => { ... })
   ```

2. **Check Backend Controller:**
   ```javascript
   // In paymentController.js
   const io = req.app.get('io');
   if (io) {
     io.to('admin-room').emit('new-order', { ... });
     console.log('📡 Emitted new-order event');
   } else {
     console.log('❌ io is undefined!');
   }
   ```

3. **Verify io is Set:**
   ```javascript
   // In server.js
   app.set('io', io);  // Must be before routes
   ```

---

### Issue 4: CORS Errors

**Symptoms:**
- Console error: "blocked by CORS policy"
- Socket connects then immediately disconnects

**Solutions:**

1. **Update Backend CORS Config:**
   ```javascript
   // In server.js
   const allowedOrigins = [
     'http://localhost:5173',
     'http://localhost:3000',
     process.env.CLIENT_URL
   ].filter(Boolean);
   ```

2. **Socket.IO CORS:**
   ```javascript
   const io = socketIO(server, {
     cors: {
       origin: allowedOrigins,
       credentials: true,
       methods: ['GET', 'POST']
     }
   });
   ```

---

### Issue 5: Multiple Socket Connections

**Symptoms:**
- Receiving duplicate notifications
- Multiple socket IDs in console

**Solutions:**

1. **Check for Multiple SocketProvider:**
   - Should only wrap App once
   - Currently in `App.jsx` ✅

2. **Check React StrictMode:**
   ```javascript
   // In main.jsx
   // StrictMode causes double render in development
   // This is normal, won't happen in production
   ```

3. **Ensure Cleanup:**
   ```javascript
   // SocketContext.jsx already has:
   return () => {
     newSocket.disconnect();
   };
   ```

---

## ✅ Verification Checklist

Use this checklist to verify everything is working:

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173
- [ ] Admin logged in with role 'admin'
- [ ] Socket.IO connection shows "Connected" with green dot
- [ ] Console shows "Admin joined admin room"
- [ ] Test notification button works
- [ ] Real order creates notification
- [ ] Notification appears in navbar bell
- [ ] Unread count badge shows correct number
- [ ] Click notification navigates to orders page
- [ ] Browser notification permission granted (optional)

---

## 🔍 Advanced Debugging

### Check Socket Rooms (Backend)

Add this debug endpoint:

```javascript
// In server.js
app.get('/api/socket/debug', (req, res) => {
  const io = req.app.get('io');
  const rooms = [];
  
  io.of('/').adapter.rooms.forEach((sockets, room) => {
    rooms.push({
      room: room,
      clients: Array.from(sockets)
    });
  });
  
  res.json({
    totalConnections: io.of('/').sockets.size,
    rooms: rooms
  });
});
```

**Test it:**
```
GET http://localhost:5000/api/socket/debug
```

**Expected Response:**
```json
{
  "totalConnections": 1,
  "rooms": [
    { "room": "admin-room", "clients": ["socket-id"] }
  ]
}
```

---

### Monitor Socket Events (Frontend)

Add to SocketContext for debugging:

```javascript
// Log all events
newSocket.onAny((eventName, ...args) => {
  console.log(`📨 Received event: ${eventName}`, args);
});
```

---

### Test Backend Emission Directly

Use this script to test backend:

```javascript
// test-socket.js
const io = require('socket.io-client');

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
  socket.emit('join-admin-room');
  
  socket.on('new-order', (data) => {
    console.log('📦 Received new-order:', data);
  });
});

// Keep alive
setInterval(() => {}, 1000);
```

Run: `node test-socket.js`

---

## 📝 Quick Fix Commands

### Reset Everything

```bash
# Windows PowerShell

# 1. Kill all Node processes
taskkill /F /IM node.exe

# 2. Clear npm cache
cd backend
npm cache clean --force
cd ../frontend
npm cache clean --force

# 3. Reinstall dependencies
cd ../backend
Remove-Item -Recurse -Force node_modules
npm install

cd ../frontend
Remove-Item -Recurse -Force node_modules
npm install

# 4. Restart servers
cd ../backend
npm run dev

# In new terminal:
cd frontend
npm run dev
```

---

## 🎓 Understanding the Flow

### Order Placement Flow

1. **User places order** → `paymentController.js`
2. **Booking created** → Database save
3. **Get io instance** → `req.app.get('io')`
4. **Emit event** → `io.to('admin-room').emit('new-order', data)`
5. **Admin socket receives** → `socket.on('new-order', ...)`
6. **Add to state** → `setNotifications([new, ...old])`
7. **UI updates** → Navbar shows badge
8. **Sound plays** → Audio notification
9. **Browser notification** → Desktop alert (if permitted)

---

## 📞 Still Not Working?

If notifications still don't work after all these steps:

### Collect Debug Information

1. **Backend Console Output** (full log)
2. **Frontend Console Output** (F12 → Console)
3. **Network Tab** (F12 → Network → WS filter)
4. **Test Page Screenshot**
5. **Environment Variables** (both .env files)

### Check These Files

Ensure these files match the implementation:

- `backend/server.js` - Socket.IO initialization
- `backend/controller/paymentController.js` - Event emission
- `frontend/src/context/SocketContext.jsx` - Event listeners
- `frontend/src/admin/components/AdminNavbar.jsx` - UI display
- `frontend/src/.env` - Environment config

---

## 🎉 Success Indicators

When everything works correctly, you should see:

### Backend Console:
```
✅ Socket.IO initialized
👤 Client connected: xyz123
✅ Admin joined admin room
📡 Socket.IO: New order notification emitted
```

### Frontend Console:
```
🔌 Connecting to Socket.IO server: http://localhost:5000
✅ Socket connected: xyz123
👤 Current user: { role: "admin", ... }
🔧 Admin user - Joining admin room
📦 New order received: { orderId: "...", amount: 5000 }
```

### UI:
- Green pulsing dot on bell icon
- Red badge with number (1, 2, 3...)
- Notification dropdown shows new orders
- Sound plays
- Desktop notification appears

---

**Last Updated:** 2026-09-09  
**Version:** 1.0
