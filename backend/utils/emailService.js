const SibApiV3Sdk = require('@sendinblue/client');
const Email = require('../models/Email');

// Initialize Brevo API client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

/**
 * Send booking confirmation email
 * @param {Object} booking - Booking object with all details
 * @returns {Promise}
 */
exports.sendBookingConfirmation = async (booking) => {
  let emailRecord = null;
  
  try {
    // Create email record in database
    emailRecord = await Email.create({
      booking: booking._id,
      recipient: {
        email: booking.customer.email,
        name: booking.customer.name,
      },
      emailType: 'booking_confirmation',
      subject: `Order Confirmation - #${booking._id.toString().slice(-8).toUpperCase()}`,
      status: 'pending',
      metadata: {
        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentStatus,
        totalAmount: booking.total,
      },
    });

    if (!process.env.BREVO_API_KEY) {
      console.warn('⚠️  BREVO_API_KEY not set. Skipping email notification.');
      emailRecord.status = 'failed';
      emailRecord.errorMessage = 'Email service not configured';
      await emailRecord.save();
      return { success: false, message: 'Email service not configured' };
    }

    // Format order items for email
    const orderItemsHtml = booking.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <strong>${item.name}</strong><br/>
            <small style="color: #6b7280;">Size: ${item.size} | Qty: ${item.quantity}</small>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ₹${item.price.toFixed(2)}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ₹${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>
      `
      )
      .join('');

    // Format payment method
    const paymentMethodText =
      booking.paymentMethod === 'cod'
        ? 'Cash on Delivery (COD)'
        : booking.paymentMethod === 'upi'
        ? 'UPI'
        : 'Card';

    // Payment status badge color
    const paymentStatusColor =
      booking.paymentStatus === 'paid'
        ? '#10b981'
        : booking.paymentStatus === 'pending'
        ? '#f59e0b'
        : '#ef4444';

    // Email HTML template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B0000 0%, #660000 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                Order Confirmed! 🎉
              </h1>
              <p style="margin: 10px 0 0; color: #fef3c7; font-size: 14px;">
                Thank you for shopping with Priya Textiles
              </p>
            </td>
          </tr>

          <!-- Order ID -->
          <tr>
            <td style="padding: 30px 30px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px; border-radius: 8px; text-align: center;">
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Order ID</p>
                    <h2 style="margin: 0; color: #111827; font-size: 24px; font-weight: 700; letter-spacing: 1px;">
                      #${booking._id.toString().slice(-8).toUpperCase()}
                    </h2>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Customer Info -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <h3 style="margin: 0 0 15px; color: #111827; font-size: 18px; font-weight: 600;">
                Delivery Details
              </h3>
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #8B0000;">
                <p style="margin: 0 0 8px; color: #111827; font-weight: 600;">${booking.customer.name}</p>
                <p style="margin: 0 0 5px; color: #6b7280; font-size: 14px;">${booking.customer.address}</p>
                <p style="margin: 0 0 5px; color: #6b7280; font-size: 14px;">${booking.customer.city}, ${booking.customer.state} - ${booking.customer.pincode}</p>
                <p style="margin: 0 0 5px; color: #6b7280; font-size: 14px;">📞 ${booking.customer.phone}</p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">✉️ ${booking.customer.email}</p>
              </div>
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <h3 style="margin: 0 0 15px; color: #111827; font-size: 18px; font-weight: 600;">
                Order Items
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #e5e7eb;">
                    <th style="padding: 12px; text-align: left; color: #374151; font-size: 13px; font-weight: 600;">ITEM</th>
                    <th style="padding: 12px; text-align: right; color: #374151; font-size: 13px; font-weight: 600;">PRICE</th>
                    <th style="padding: 12px; text-align: right; color: #374151; font-size: 13px; font-weight: 600;">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Order Summary -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Subtotal</td>
                  <td style="padding: 8px 0; text-align: right; color: #111827; font-weight: 600;">₹${booking.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Shipping</td>
                  <td style="padding: 8px 0; text-align: right; color: #111827; font-weight: 600;">
                    ${booking.shipping === 0 ? 'FREE' : `₹${booking.shipping.toFixed(2)}`}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 0 0; border-top: 2px solid #d1d5db; color: #111827; font-size: 18px; font-weight: 700;">Total</td>
                  <td style="padding: 15px 0 0; border-top: 2px solid #d1d5db; text-align: right; color: #8B0000; font-size: 20px; font-weight: 700;">₹${booking.total.toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment Details -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 15px; color: #111827; font-size: 18px; font-weight: 600;">
                Payment Information
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
                <tr>
                  <td style="padding: 5px 0; color: #6b7280; font-size: 14px;">Payment Method</td>
                  <td style="padding: 5px 0; text-align: right; color: #111827; font-weight: 600;">${paymentMethodText}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6b7280; font-size: 14px;">Payment Status</td>
                  <td style="padding: 5px 0; text-align: right;">
                    <span style="display: inline-block; padding: 4px 12px; border-radius: 999px; background-color: ${paymentStatusColor}; color: #ffffff; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                      ${booking.paymentStatus}
                    </span>
                  </td>
                </tr>
                ${booking.razorpayPaymentId ? `
                <tr>
                  <td style="padding: 5px 0; color: #6b7280; font-size: 14px;">Payment ID</td>
                  <td style="padding: 5px 0; text-align: right; color: #111827; font-family: monospace; font-size: 12px;">${booking.razorpayPaymentId}</td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px;">
                Track your order status and view details anytime
              </p>
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/orders" 
                 style="display: inline-block; padding: 12px 30px; background-color: #8B0000; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                View My Orders
              </a>
              <p style="margin: 20px 0 0; color: #9ca3af; font-size: 12px;">
                Questions? Contact us at support@priyatextiles.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Email configuration
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = {
      name: 'Priya Textiles',
      email: process.env.BREVO_SENDER_EMAIL,
    };
    sendSmtpEmail.to = [
      {
        email: booking.customer.email,
        name: booking.customer.name,
      },
    ];
    sendSmtpEmail.subject = `Order Confirmation - #${booking._id.toString().slice(-8).toUpperCase()}`;
    sendSmtpEmail.htmlContent = htmlContent;

    // Send email
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Booking confirmation email sent:', result.messageId);

    // Update email record
    emailRecord.status = 'sent';
    emailRecord.messageId = result.messageId;
    emailRecord.sentAt = new Date();
    await emailRecord.save();

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error('❌ Failed to send booking confirmation email:', error.message);
    
    // Update email record with error
    if (emailRecord) {
      emailRecord.status = 'failed';
      emailRecord.errorMessage = error.message;
      await emailRecord.save();
    }
    
    return {
      success: false,
      message: error.message,
    };
  }
};

/**
 * Send admin notification email when new order is placed
 * @param {Object} booking - Booking object with all details
 * @returns {Promise}
 */
exports.sendAdminOrderNotification = async (booking) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.warn('⚠️  BREVO_API_KEY not set. Skipping admin email notification.');
      return { success: false, message: 'Email service not configured' };
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'parthipriya364@gmail.com';

    // Format order items for email
    const orderItemsHtml = booking.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <strong>${item.name}</strong><br/>
            <small style="color: #6b7280;">Size: ${item.size} | Qty: ${item.quantity}</small>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ₹${item.price.toFixed(2)}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ₹${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>
      `
      )
      .join('');

    // Format payment method
    const paymentMethodText =
      booking.paymentMethod === 'cod'
        ? 'Cash on Delivery (COD)'
        : booking.paymentMethod === 'upi'
        ? 'UPI'
        : 'Card/Razorpay';

    // Payment status badge color
    const paymentStatusColor =
      booking.paymentStatus === 'paid'
        ? '#10b981'
        : booking.paymentStatus === 'pending'
        ? '#f59e0b'
        : '#ef4444';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                🛍️ New Order Received!
              </h1>
              <p style="margin: 10px 0 0; color: #d1fae5; font-size: 14px;">
                Priya Textiles Admin Notification
              </p>
            </td>
          </tr>

          <!-- Order ID & Date -->
          <tr>
            <td style="padding: 30px 30px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
                    <table width="100%">
                      <tr>
                        <td>
                          <p style="margin: 0 0 4px; color: #047857; font-size: 12px; font-weight: 600;">ORDER ID</p>
                          <h2 style="margin: 0; color: #065f46; font-size: 20px; font-weight: 700; letter-spacing: 1px;">
                            #${booking._id.toString().slice(-8).toUpperCase()}
                          </h2>
                        </td>
                        <td style="text-align: right;">
                          <p style="margin: 0 0 4px; color: #047857; font-size: 12px; font-weight: 600;">DATE & TIME</p>
                          <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600;">
                            ${new Date(booking.createdAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Quick Stats -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" style="padding: 0 5px;">
                    <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; text-align: center;">
                      <p style="margin: 0 0 5px; color: #92400e; font-size: 11px; font-weight: 600;">ITEMS</p>
                      <p style="margin: 0; color: #78350f; font-size: 20px; font-weight: 700;">${booking.items.length}</p>
                    </div>
                  </td>
                  <td width="33%" style="padding: 0 5px;">
                    <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; text-align: center;">
                      <p style="margin: 0 0 5px; color: #1e40af; font-size: 11px; font-weight: 600;">TOTAL</p>
                      <p style="margin: 0; color: #1e3a8a; font-size: 20px; font-weight: 700;">₹${booking.total.toFixed(2)}</p>
                    </div>
                  </td>
                  <td width="33%" style="padding: 0 5px;">
                    <div style="background-color: ${paymentStatusColor === '#10b981' ? '#d1fae5' : '#fef3c7'}; padding: 15px; border-radius: 8px; text-align: center;">
                      <p style="margin: 0 0 5px; color: ${paymentStatusColor === '#10b981' ? '#065f46' : '#92400e'}; font-size: 11px; font-weight: 600;">PAYMENT</p>
                      <p style="margin: 0; color: ${paymentStatusColor}; font-size: 14px; font-weight: 700; text-transform: uppercase;">${booking.paymentStatus}</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Customer Info -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <h3 style="margin: 0 0 15px; color: #111827; font-size: 18px; font-weight: 600;">
                👤 Customer Details
              </h3>
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
                <table width="100%">
                  <tr>
                    <td style="padding-bottom: 10px;">
                      <p style="margin: 0 0 5px; color: #6b7280; font-size: 12px;">Name</p>
                      <p style="margin: 0; color: #111827; font-weight: 600; font-size: 15px;">${booking.customer.name}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 10px;">
                      <p style="margin: 0 0 5px; color: #6b7280; font-size: 12px;">Email</p>
                      <p style="margin: 0; color: #111827; font-weight: 600; font-size: 14px;">${booking.customer.email}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 10px;">
                      <p style="margin: 0 0 5px; color: #6b7280; font-size: 12px;">Phone</p>
                      <p style="margin: 0; color: #111827; font-weight: 600; font-size: 14px;">${booking.customer.phone}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p style="margin: 0 0 5px; color: #6b7280; font-size: 12px;">Delivery Address</p>
                      <p style="margin: 0; color: #111827; font-weight: 600; font-size: 14px; line-height: 1.6;">
                        ${booking.customer.address}<br/>
                        ${booking.customer.city}, ${booking.customer.state} - ${booking.customer.pincode}
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <h3 style="margin: 0 0 15px; color: #111827; font-size: 18px; font-weight: 600;">
                📦 Order Items
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #e5e7eb;">
                    <th style="padding: 12px; text-align: left; color: #374151; font-size: 13px; font-weight: 600;">ITEM</th>
                    <th style="padding: 12px; text-align: right; color: #374151; font-size: 13px; font-weight: 600;">PRICE</th>
                    <th style="padding: 12px; text-align: right; color: #374151; font-size: 13px; font-weight: 600;">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Order Summary -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Subtotal</td>
                  <td style="padding: 8px 0; text-align: right; color: #111827; font-weight: 600;">₹${booking.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Shipping</td>
                  <td style="padding: 8px 0; text-align: right; color: #111827; font-weight: 600;">
                    ${booking.shipping === 0 ? 'FREE' : `₹${booking.shipping.toFixed(2)}`}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 0 0; border-top: 2px solid #d1d5db; color: #111827; font-size: 18px; font-weight: 700;">Total Amount</td>
                  <td style="padding: 15px 0 0; border-top: 2px solid #d1d5db; text-align: right; color: #059669; font-size: 20px; font-weight: 700;">₹${booking.total.toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment Details -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 15px; color: #111827; font-size: 18px; font-weight: 600;">
                💳 Payment Information
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
                <tr>
                  <td style="padding: 5px 0; color: #6b7280; font-size: 14px;">Payment Method</td>
                  <td style="padding: 5px 0; text-align: right; color: #111827; font-weight: 600;">${paymentMethodText}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6b7280; font-size: 14px;">Payment Status</td>
                  <td style="padding: 5px 0; text-align: right;">
                    <span style="display: inline-block; padding: 4px 12px; border-radius: 999px; background-color: ${paymentStatusColor}; color: #ffffff; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                      ${booking.paymentStatus}
                    </span>
                  </td>
                </tr>
                ${booking.razorpayPaymentId ? `
                <tr>
                  <td style="padding: 5px 0; color: #6b7280; font-size: 14px;">Payment ID</td>
                  <td style="padding: 5px 0; text-align: right; color: #111827; font-family: monospace; font-size: 12px;">${booking.razorpayPaymentId}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 5px 0; color: #6b7280; font-size: 14px;">Order Status</td>
                  <td style="padding: 5px 0; text-align: right;">
                    <span style="display: inline-block; padding: 4px 12px; border-radius: 999px; background-color: #3b82f6; color: #ffffff; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                      ${booking.orderStatus}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/orders" 
                 style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(5, 150, 105, 0.3);">
                View in Admin Dashboard →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                This is an automated admin notification from Priya Textiles
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = {
      name: 'Priya Textiles - Order System',
      email: process.env.BREVO_SENDER_EMAIL || 'noreply@priyatextiles.com',
    };
    sendSmtpEmail.to = [
      {
        email: adminEmail,
        name: 'Priya Textiles Admin',
      },
    ];
    sendSmtpEmail.subject = `🛍️ New Order #${booking._id.toString().slice(-8).toUpperCase()} - ₹${booking.total.toFixed(2)}`;
    sendSmtpEmail.htmlContent = htmlContent;

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Admin notification email sent to', adminEmail, ':', result.messageId);

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error('❌ Failed to send admin notification email:', error.message);
    return {
      success: false,
      message: error.message,
    };
  }
};

/**
 * Send order status update email
 * @param {Object} booking - Booking object with updated status
 * @param {String} oldStatus - Previous order status
 * @returns {Promise}
 */
exports.sendOrderStatusUpdate = async (booking, oldStatus) => {
  let emailRecord = null;
  
  try {
    // Create email record in database
    emailRecord = await Email.create({
      booking: booking._id,
      recipient: {
        email: booking.customer.email,
        name: booking.customer.name,
      },
      emailType: 'status_update',
      subject: `Order Status Update - #${booking._id.toString().slice(-8).toUpperCase()}`,
      status: 'pending',
      metadata: {
        oldStatus: oldStatus,
        newStatus: booking.orderStatus,
        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentStatus,
      },
    });

    if (!process.env.BREVO_API_KEY) {
      console.warn('⚠️  BREVO_API_KEY not set. Skipping email notification.');
      emailRecord.status = 'failed';
      emailRecord.errorMessage = 'Email service not configured';
      await emailRecord.save();
      return { success: false, message: 'Email service not configured' };
    }

    const statusMessages = {
      confirmed: {
        title: 'Order Confirmed',
        message: 'Your order has been confirmed and is being prepared for shipment.',
        emoji: '✅',
      },
      shipped: {
        title: 'Order Shipped',
        message: 'Great news! Your order is on its way to you.',
        emoji: '🚚',
      },
      delivered: {
        title: 'Order Delivered',
        message: 'Your order has been successfully delivered. We hope you love it!',
        emoji: '🎉',
      },
      cancelled: {
        title: 'Order Cancelled',
        message: 'Your order has been cancelled as requested.',
        emoji: '❌',
      },
    };

    const statusInfo = statusMessages[booking.orderStatus] || {
      title: 'Order Status Update',
      message: `Your order status has been updated to ${booking.orderStatus}.`,
      emoji: 'ℹ️',
    };

    // Format order items for email (for shipped and delivered emails)
    const orderItemsHtml = booking.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <strong>${item.name}</strong><br/>
            <small style="color: #6b7280;">Size: ${item.size} | Qty: ${item.quantity}</small>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ₹${item.price.toFixed(2)}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ₹${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>
      `
      )
      .join('');

    // Show full details for shipped and delivered status
    const showFullDetails = booking.orderStatus === 'shipped' || booking.orderStatus === 'delivered';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B0000 0%, #660000 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                ${statusInfo.emoji} ${statusInfo.title}
              </h1>
              <p style="margin: 10px 0 0; color: #fef3c7; font-size: 14px;">
                ${statusInfo.message}
              </p>
            </td>
          </tr>

          <!-- Order ID -->
          <tr>
            <td style="padding: 30px 30px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px; border-radius: 8px; text-align: center;">
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Order ID</p>
                    <h2 style="margin: 0; color: #111827; font-size: 24px; font-weight: 700; letter-spacing: 1px;">
                      #${booking._id.toString().slice(-8).toUpperCase()}
                    </h2>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${showFullDetails ? `
          <!-- Customer Info -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <h3 style="margin: 0 0 15px; color: #111827; font-size: 18px; font-weight: 600;">
                Delivery Details
              </h3>
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #8B0000;">
                <p style="margin: 0 0 8px; color: #111827; font-weight: 600;">${booking.customer.name}</p>
                <p style="margin: 0 0 5px; color: #6b7280; font-size: 14px;">${booking.customer.address}</p>
                <p style="margin: 0 0 5px; color: #6b7280; font-size: 14px;">${booking.customer.city}, ${booking.customer.state} - ${booking.customer.pincode}</p>
                <p style="margin: 0 0 5px; color: #6b7280; font-size: 14px;">📞 ${booking.customer.phone}</p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">✉️ ${booking.customer.email}</p>
              </div>
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <h3 style="margin: 0 0 15px; color: #111827; font-size: 18px; font-weight: 600;">
                Order Items
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #e5e7eb;">
                    <th style="padding: 12px; text-align: left; color: #374151; font-size: 13px; font-weight: 600;">ITEM</th>
                    <th style="padding: 12px; text-align: right; color: #374151; font-size: 13px; font-weight: 600;">PRICE</th>
                    <th style="padding: 12px; text-align: right; color: #374151; font-size: 13px; font-weight: 600;">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Order Summary -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Subtotal</td>
                  <td style="padding: 8px 0; text-align: right; color: #111827; font-weight: 600;">₹${booking.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Shipping</td>
                  <td style="padding: 8px 0; text-align: right; color: #111827; font-weight: 600;">
                    ${booking.shipping === 0 ? 'FREE' : `₹${booking.shipping.toFixed(2)}`}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 0 0; border-top: 2px solid #d1d5db; color: #111827; font-size: 18px; font-weight: 700;">Total</td>
                  <td style="padding: 15px 0 0; border-top: 2px solid #d1d5db; text-align: right; color: #8B0000; font-size: 20px; font-weight: 700;">₹${booking.total.toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          ${booking.orderStatus === 'delivered' ? `
          <!-- Review Invitation for Delivered Orders -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 8px; text-align: center;">
                <h3 style="margin: 0 0 10px; color: #92400e; font-size: 18px; font-weight: 600;">
                  ⭐ Love your purchase?
                </h3>
                <p style="margin: 0 0 20px; color: #78350f; font-size: 14px;">
                  Share your experience and help others make the right choice!
                </p>
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/order/${booking._id}" 
                   style="display: inline-block; padding: 12px 30px; background-color: #8B0000; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                  Write a Review
                </a>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Call to Action -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/order/${booking._id}" 
                 style="display: inline-block; padding: 12px 30px; background-color: #8B0000; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                View Order Details
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Thank you for shopping with Priya Textiles!
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Questions? Contact us at support@priyatextiles.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = {
      name: 'Priya Textiles',
      email: process.env.BREVO_SENDER_EMAIL || 'noreply@priyatextiles.com',
    };
    sendSmtpEmail.to = [
      {
        email: booking.customer.email,
        name: booking.customer.name,
      },
    ];
    sendSmtpEmail.subject = `${statusInfo.title} - Order #${booking._id.toString().slice(-8).toUpperCase()}`;
    sendSmtpEmail.htmlContent = htmlContent;

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Order status update email sent:', result.messageId);

    // Update email record
    emailRecord.status = 'sent';
    emailRecord.messageId = result.messageId;
    emailRecord.sentAt = new Date();
    await emailRecord.save();

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error('❌ Failed to send order status update email:', error.message);
    
    // Update email record with error
    if (emailRecord) {
      emailRecord.status = 'failed';
      emailRecord.errorMessage = error.message;
      await emailRecord.save();
    }
    
    return {
      success: false,
      message: error.message,
    };
  }
};
