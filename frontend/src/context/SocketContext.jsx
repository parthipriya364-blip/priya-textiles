import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { SOCKET_BASE_URL } from '../config';
import { getStoredUser } from '../services/authService';

const SocketContext = createContext(null);

const SOCKET_URL = SOCKET_BASE_URL;

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState([]);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Socket.IO connected:', newSocket.id);
      setConnected(true);

      // Join user room if authenticated
      const user = getStoredUser();
      if (user && user.id) {
        newSocket.emit('join-user-room', user.id);
        console.log('👤 Joined user room:', user.id);
      }

      // Join admin room if user is admin
      if (user && user.role === 'admin') {
        newSocket.emit('join-admin-room');
        console.log('👑 Joined admin room');
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    // Listen for order status updates
    newSocket.on('order-status-updated', (data) => {
      console.log('📦 Order status updated:', data);
      setOrderUpdates((prev) => [...prev, data]);
    });

    // Listen for admin order updates
    newSocket.on('order-updated', (data) => {
      console.log('📊 Admin: Order updated:', data);
      setOrderUpdates((prev) => [...prev, data]);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Join specific order room
  const joinOrderRoom = (orderId) => {
    if (socket && orderId) {
      socket.emit('join-order-room', orderId);
      console.log('🔔 Joined order room:', orderId);
    }
  };

  // Leave specific order room
  const leaveOrderRoom = (orderId) => {
    if (socket && orderId) {
      socket.emit('leave-order-room', orderId);
      console.log('👋 Left order room:', orderId);
    }
  };

  // Clear order updates
  const clearOrderUpdates = () => {
    setOrderUpdates([]);
  };

  const value = {
    socket,
    connected,
    orderUpdates,
    joinOrderRoom,
    leaveOrderRoom,
    clearOrderUpdates,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
