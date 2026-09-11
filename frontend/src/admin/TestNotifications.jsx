import { useState } from 'react';
import { useSocket } from '../context/SocketContext';

export default function TestNotifications() {
  const { socket, connected, notifications, unreadCount } = useSocket();
  const [testData, setTestData] = useState({
    customerName: 'Test Customer',
    amount: 5000,
  });

  const sendTestNotification = (type) => {
    if (!socket) {
      alert('Socket not connected!');
      return;
    }

    const testPayloads = {
      'new-order': {
        orderId: `TEST${Date.now()}`,
        customerName: testData.customerName,
        customerEmail: 'test@example.com',
        amount: testData.amount,
        paymentMethod: 'test',
        paymentStatus: 'paid',
        itemCount: 3,
        timestamp: new Date().toISOString(),
      },
      'payment-received': {
        orderId: `TEST${Date.now()}`,
        amount: testData.amount,
        paymentMethod: 'test',
      },
      'low-stock-alert': {
        productId: 'test123',
        productName: 'Test Product',
        stock: 5,
        threshold: 10,
      },
      'order-status-updated': {
        orderId: `TEST${Date.now()}`,
        orderStatus: 'shipped',
        status: 'shipped',
        message: 'Your order has been shipped',
      },
    };

    const payload = testPayloads[type];
    
    console.log(`🧪 Sending test ${type} event:`, payload);
    
    // Emit to backend which will broadcast to admin room
    socket.emit('test-notification', { type, payload });
    
    alert(`Test ${type} notification sent! Check the notification bell.`);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '14px', 
        padding: '24px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '16px', fontSize: '24px', fontWeight: '700' }}>
          🧪 Socket.IO Test Panel
        </h2>

        {/* Connection Status */}
        <div style={{ 
          padding: '16px', 
          marginBottom: '24px',
          background: connected ? '#ecfdf5' : '#fef2f2',
          borderRadius: '10px',
          border: `2px solid ${connected ? '#10b981' : '#ef4444'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%',
              background: connected ? '#10b981' : '#ef4444',
              display: 'block'
            }}></span>
            <strong style={{ fontSize: '16px' }}>
              {connected ? '✅ Connected' : '❌ Disconnected'}
            </strong>
          </div>
          {socket && (
            <div style={{ marginTop: '8px', fontSize: '13px', color: '#6b7280' }}>
              Socket ID: {socket.id}
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ 
            padding: '16px', 
            background: '#f9fafb',
            borderRadius: '10px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
              Total Notifications
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
              {notifications.length}
            </div>
          </div>
          <div style={{ 
            padding: '16px', 
            background: '#fef2f2',
            borderRadius: '10px',
            border: '1px solid #fecaca'
          }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
              Unread
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#dc2626' }}>
              {unreadCount}
            </div>
          </div>
        </div>

        {/* Test Input */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
            Test Data
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', fontWeight: '500' }}>
                Customer Name
              </label>
              <input
                type="text"
                value={testData.customerName}
                onChange={(e) => setTestData({ ...testData, customerName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', fontWeight: '500' }}>
                Amount (₹)
              </label>
              <input
                type="number"
                value={testData.amount}
                onChange={(e) => setTestData({ ...testData, amount: parseInt(e.target.value) || 0 })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
            Send Test Notifications
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            <button
              onClick={() => sendTestNotification('new-order')}
              disabled={!connected}
              style={{
                padding: '12px 20px',
                background: connected ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e7eb',
                color: connected ? 'white' : '#9ca3af',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: connected ? 'pointer' : 'not-allowed',
                transition: '0.2s'
              }}
            >
              📦 New Order
            </button>
            <button
              onClick={() => sendTestNotification('payment-received')}
              disabled={!connected}
              style={{
                padding: '12px 20px',
                background: connected ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#e5e7eb',
                color: connected ? 'white' : '#9ca3af',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: connected ? 'pointer' : 'not-allowed',
                transition: '0.2s'
              }}
            >
              💰 Payment
            </button>
            <button
              onClick={() => sendTestNotification('low-stock-alert')}
              disabled={!connected}
              style={{
                padding: '12px 20px',
                background: connected ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : '#e5e7eb',
                color: connected ? 'white' : '#9ca3af',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: connected ? 'pointer' : 'not-allowed',
                transition: '0.2s'
              }}
            >
              ⚠️ Low Stock
            </button>
            <button
              onClick={() => sendTestNotification('order-status-updated')}
              disabled={!connected}
              style={{
                padding: '12px 20px',
                background: connected ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : '#e5e7eb',
                color: connected ? 'white' : '#9ca3af',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: connected ? 'pointer' : 'not-allowed',
                transition: '0.2s'
              }}
            >
              📋 Status Update
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div style={{ 
          padding: '16px',
          background: '#fffbeb',
          borderRadius: '10px',
          border: '1px solid #fbbf24',
          fontSize: '13px',
          lineHeight: '1.6'
        }}>
          <strong style={{ display: 'block', marginBottom: '8px' }}>📝 How to Test:</strong>
          <ol style={{ marginLeft: '20px', marginBottom: '0' }}>
            <li>Make sure Socket.IO connection shows "Connected"</li>
            <li>Click any test button above</li>
            <li>Check the notification bell icon in the navbar</li>
            <li>You should see a new notification appear</li>
            <li>If nothing appears, check browser console for errors</li>
          </ol>
        </div>

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
              Recent Notifications ({notifications.length})
            </h3>
            <div style={{ 
              maxHeight: '300px', 
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '10px'
            }}>
              {notifications.slice(0, 5).map((notif) => (
                <div 
                  key={notif.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e5e7eb',
                    background: notif.read ? 'white' : '#fef3f2'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                    {notif.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {notif.message}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                    {new Date(notif.time).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
