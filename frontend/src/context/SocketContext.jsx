import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_BASE_URL } from "../config";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

const notificationDetails = {
  "new-order": {
    type: "order",
    title: "New order received",
    message: "A new order has been placed.",
  },
  "payment-received": {
    type: "payment",
    title: "Payment received",
    message: "A payment has been received.",
  },
  "order-updated": {
    type: "order-update",
    title: "Order updated",
    message: "An order has been updated.",
  },
  "low-stock-alert": {
    type: "stock",
    title: "Low stock alert",
    message: "A product is running low on stock.",
  },
  "order-status-updated": {
    type: "order-update",
    title: "Order status updated",
    message: "An order status has changed.",
  },
};

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const client = io(SOCKET_BASE_URL, {
      withCredentials: true,
      autoConnect: true,
    });

    const handleConnect = () => {
      setConnected(true);
      if (user?.role === "admin") client.emit("join-admin-room");
      if (user?.id || user?._id) client.emit("join-user-room", user.id || user._id);
    };

    const handleDisconnect = () => setConnected(false);
    const handleNotification = (eventName, payload = {}) => {
      const details = notificationDetails[eventName];
      if (!details) return;

      setNotifications((current) => [
        {
          id: `${eventName}-${Date.now()}-${Math.random()}`,
          ...details,
          message: payload.message || details.message,
          data: payload,
          time: payload.timestamp || new Date().toISOString(),
          read: false,
        },
        ...current,
      ]);
    };

    const eventHandlers = Object.keys(notificationDetails).map((eventName) => {
      const handler = (payload) => handleNotification(eventName, payload);
      client.on(eventName, handler);
      return [eventName, handler];
    });

    client.on("connect", handleConnect);
    client.on("disconnect", handleDisconnect);
    setSocket(client);
    setConnected(client.connected);

    return () => {
      client.off("connect", handleConnect);
      client.off("disconnect", handleDisconnect);
      eventHandlers.forEach(([eventName, handler]) => client.off(eventName, handler));
      client.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [user]);

  const joinOrderRoom = (orderId) => socket?.emit("join-order-room", orderId);
  const leaveOrderRoom = (orderId) => socket?.emit("leave-order-room", orderId);
  const markAsRead = (notificationId) => {
    setNotifications((current) => current.map((notification) =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    ));
  };
  const markAllAsRead = () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
  };
  const clearNotifications = () => setNotifications([]);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <SocketContext.Provider value={{
      socket,
      connected,
      notifications,
      unreadCount,
      joinOrderRoom,
      leaveOrderRoom,
      markAsRead,
      markAllAsRead,
      clearNotifications,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within a SocketProvider");
  return context;
}
