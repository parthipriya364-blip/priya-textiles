# 📧 Email Notification System - Complete Guide

## Overview

The Priya Textiles e-commerce platform uses **Brevo (formerly Sendinblue)** to send transactional emails for order confirmations, status updates, and admin notifications.

---

## 📋 Email Types

### 1. **Customer Emails**
- ✉️ **Order Confirmation** - Sent when order is placed
- 📦 **Order Status Updates** - Sent when order status changes
- ⭐ **Review Invitation** - Sent when order is delivered

### 2. **Admin Emails**
- 🛍️ **New Order Notification** - Sent to admin email when new order is placed
- Contains full order details, customer info, and payment details

---

## 🎯 Email Recipients

### Customer Emails
**To:** Customer's email address (from order form)
**Content:** Order confirmation with items, delivery address, payment details

### Admin Emails
**To:** `parthipriya364@gmail.com` (configurable in `.env`)
**Content:** New order notification with all details for admin dashboard

---

## 🔧 Configuration

### Backend .env File

```env
# Brevo (Sendinblue) Email Configuration
BREVO_API_KEY=your-brevo-api-key-here
BREVO_SENDER_EMAIL=parthipriya364@gmail.com
BREVO_SENDER_NAME=Priya Textiles

# Admin Notification Email
ADMIN_NOTIFICATION_EMAIL=parthipriya364@gmail.com
```

### Get Brevo API Key

1. Go to [https://app.brevo.com/](https://app.brevo.com/)
2. Login with **parthipriya364@gmail.com**
3. Navigate to **Settings** → **API Keys**
4. Copy the existing API key or create new one
5. Paste into `.env` file

---

## 📨 Email Flow

### When Customer Places Order

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  User Completes Checkout                          │
│          ↓                                         │
│  Payment Processed (COD/Razorpay)                 │
│          ↓                                         │
│  Booking Created in Database                      │
│          ↓                                         │
│  ┌────────────────┐      ┌────────────────┐      │
│  │  Customer      │      │   Admin        │      │
│  │  Confirmation  │      │   Notification │      │
│  │  Email         │      │   Email        │      │
│  └────────────────┘      └────────────────┘      │
│          ↓                         ↓               │
│  customer@email.com    parthipriya364@gmail.com   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📧 Email Templates

### 1. Customer Order Confirmation

**Subject:** `Order Confirmation - #ABC12345`

**Content Includes:**
- ✅ Order confirmation message
- 📋 Order ID
- 👤 Customer delivery details
- 📦 List of ordered items with prices
- 💰 Order summary (subtotal, shipping, total)
- 💳 Payment information (method, status, ID)
- 🔗 "View My Orders" button

**Design:**
- Professional maroon/red gradient header
- Clean table layout for items
- Responsive HTML email template
- Mobile-friendly design

### 2. Admin Order Notification

**Subject:** `🛍️ New Order #ABC12345 - ₹5,000.00`

**Content Includes:**
- 🛍️ New order alert header (green)
- 📋 Order ID and date/time
- 📊 Quick stats (items count, total amount, payment status)
- 👤 Complete customer details (name, email, phone, address)
- 📦 Full order items list
- 💰 Order summary
- 💳 Payment details
- 🔗 "View in Admin Dashboard" button

**Design:**
- Green gradient header (different from customer)
- Quick stats cards for easy scanning
- Detailed customer information
- Professional business email layout

### 3. Order Status Update

**Subject:** `Order Shipped - Order #ABC12345`

**Status Types:**
- ✅ **Confirmed** - Order confirmed message
- 🚚 **Shipped** - Order shipped with full details
- 🎉 **Delivered** - Order delivered + review invitation
- ❌ **Cancelled** - Order cancellation notice

**Design:**
- Status-specific emoji and color scheme
- Full order details for shipped/delivered
- Review invitation for delivered orders
- "View Order Details" button

---

## 💻 Backend Implementation

### Files Structure

```
backend/
├── utils/
│   └── emailService.js          # Email sending functions
├── controller/
│   └── paymentController.js     # Triggers email sends
└── models/
    └── Email.js                  # Email tracking model
```

### Email Service Functions

#### 1. sendBookingConfirmation(booking)

```javascript
exports.sendBookingConfirmation = async (booking) => {
  // Creates email record in database
  // Formats order details into HTML
  // Sends email to customer via Brevo API
  // Updates email record with status
};
```

#### 2. sendAdminOrderNotification(booking)

```javascript
exports.sendAdminOrderNotification = async (booking) => {
  // Sends detailed order notification to admin
  // Uses admin email from environment variable
  // Includes all order and customer details
};
```

#### 3. sendOrderStatusUpdate(booking, oldStatus)

```javascript
exports.sendOrderStatusUpdate = async (booking, oldStatus) => {
  // Sends status update email to customer
  // Different content based on new status
  // Includes review invitation for delivered orders
};
```

### Payment Controller Integration

```javascript
// In createCODBooking and verifyAndCreateBooking:

// Send confirmation email to customer
sendBookingConfirmation(booking).catch(err => 
  console.error('Email notification failed:', err.message)
);

// Send admin notification email
sendAdminOrderNotification(booking).catch(err =>
  console.error('Admin notification email failed:', err.message)
);
```

---

## 📊 Email Tracking

### Email Model

Each email is tracked in database:

```javascript
{
  booking: ObjectId,           // Reference to booking
  recipient: {
    email: String,             // Recipient email
    name: String               // Recipient name
  },
  emailType: String,           // 'booking_confirmation', 'status_update', etc.
  subject: String,             // Email subject
  status: String,              // 'pending', 'sent', 'failed'
  messageId: String,           // Brevo message ID
  errorMessage: String,        // Error if failed
  sentAt: Date,                // When sent
  metadata: Object             // Additional data
}
```

### Viewing Email Logs

```javascript
// Get all emails for a booking
const emails = await Email.find({ booking: bookingId });

// Get failed emails
const failed = await Email.find({ status: 'failed' });

// Get emails by type
const confirmations = await Email.find({ emailType: 'booking_confirmation' });
```

---

## 🎨 Email Design Features

### Customer Email Design
- ✨ Maroon/Red gradient header (#8B0000)
- 📋 Clean order summary table
- 💳 Color-coded payment status badges
- 🔘 Prominent call-to-action buttons
- 📱 Mobile-responsive design
- 🎯 Professional typography

### Admin Email Design
- 🟢 Green gradient header (#059669)
- 📊 Quick stats cards
- 👤 Detailed customer info section
- 📦 Complete order breakdown
- 🔗 Direct link to admin dashboard
- ⚡ Easy-to-scan layout

---

## 🚀 Testing Email System

### Test Order Flow

1. **Place Test Order:**
   ```
   - Go to: http://localhost:5173
   - Add products to cart
   - Complete checkout
   - Use COD payment
   ```

2. **Check Console:**
   ```
   ✅ COD booking created: [booking-id]
   ✅ Booking confirmation email sent: [message-id]
   ✅ Admin notification email sent to parthipriya364@gmail.com: [message-id]
   ```

3. **Check Emails:**
   - Customer receives confirmation at their email
   - Admin receives notification at parthipriya364@gmail.com

### Manual Test

```javascript
// In backend, test email sending:
const { sendBookingConfirmation } = require('./utils/emailService');

// Find a booking
const booking = await Booking.findById('booking-id')
  .populate('items.product', 'name slug image category')
  .populate('user', 'name email');

// Send test email
await sendBookingConfirmation(booking);
```

---

## 🐛 Troubleshooting

### Issue: Emails Not Sending

**Check:**
1. ✅ BREVO_API_KEY is set in `.env`
2. ✅ API key is valid (not expired)
3. ✅ Sender email is verified in Brevo
4. ✅ Backend console shows email sending attempts

**Solution:**
```bash
# Check .env file
cat backend/.env | grep BREVO

# Restart backend server
cd backend
npm run dev
```

### Issue: Admin Email Not Received

**Check:**
1. ✅ ADMIN_NOTIFICATION_EMAIL is set correctly
2. ✅ Email not in spam folder
3. ✅ Brevo sender limits not exceeded

**Solution:**
```env
# Update .env
ADMIN_NOTIFICATION_EMAIL=parthipriya364@gmail.com
```

### Issue: Email Shows Failed in Database

**Check:**
```javascript
// Find failed emails
const failed = await Email.find({ status: 'failed' });
console.log(failed.map(e => ({
  recipient: e.recipient.email,
  error: e.errorMessage
})));
```

**Common Errors:**
- `Email service not configured` → BREVO_API_KEY missing
- `Invalid API key` → API key expired or wrong
- `Sender not verified` → Verify sender email in Brevo

---

## 📈 Email Statistics

### Brevo Dashboard

View email statistics at: [https://app.brevo.com/](https://app.brevo.com/)

**Metrics Available:**
- 📊 Total emails sent
- ✅ Delivery rate
- 📖 Open rate
- 🖱️ Click rate
- ❌ Bounce rate
- 📧 Spam complaints

### Database Tracking

```javascript
// Get email stats
const stats = await Email.aggregate([
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 }
    }
  }
]);

// Results:
// [
//   { _id: 'sent', count: 150 },
//   { _id: 'failed', count: 5 },
//   { _id: 'pending', count: 2 }
// ]
```

---

## 🔒 Security Best Practices

### API Key Security
- ✅ Never commit `.env` file to git
- ✅ Use environment variables
- ✅ Rotate API keys periodically
- ✅ Limit API key permissions in Brevo

### Email Content
- ✅ Sanitize user inputs
- ✅ Don't include sensitive data
- ✅ Use HTTPS links only
- ✅ Validate email addresses

---

## 📚 API Documentation

### Brevo API Endpoint

```javascript
const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
sendSmtpEmail.sender = {
  name: 'Priya Textiles',
  email: 'parthipriya364@gmail.com'
};
sendSmtpEmail.to = [{ email: 'customer@email.com', name: 'Customer Name' }];
sendSmtpEmail.subject = 'Order Confirmation';
sendSmtpEmail.htmlContent = '<html>...</html>';

const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
```

### Response

```javascript
{
  messageId: '<202401234567.89012@smtp-relay.brevo.com>'
}
```

---

## 🎯 Summary

✅ **Customer emails** - Order confirmations and status updates  
✅ **Admin emails** - New order notifications to parthipriya364@gmail.com  
✅ **Brevo integration** - Professional transactional email service  
✅ **Email tracking** - All emails logged in database  
✅ **Beautiful templates** - Responsive HTML email designs  
✅ **Error handling** - Graceful failures with logging  

**Email System Status:** ✅ Fully Functional!

---

**Last Updated:** 2026-09-09  
**Version:** 1.0  
**Maintained By:** Priya Textiles Development Team
