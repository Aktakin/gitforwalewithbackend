import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../lib/supabase';
import { useAuth } from './SupabaseAuthContext';

// Create context
const SocketContext = createContext();

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Simple Socket Provider Component
export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [isConnected] = useState(false);
  const [onlineUsers] = useState(new Set());
  const [unreadMessages] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const fetchedNotifications = await db.notifications.getUserNotifications(user.id);
      
      // Transform notifications to match expected format
      const transformedNotifications = fetchedNotifications.map(notif => ({
        id: notif.id,
        type: notif.type || 'system',
        title: notif.title,
        message: notif.message,
        read: notif.read || false,
        timestamp: new Date(notif.created_at),
        sender: { name: 'System' }, // Could be enhanced to fetch sender info
        related_id: notif.related_id
      }));

      setNotifications(transformedNotifications);
      
      // Fetch unread count
      const count = await db.notifications.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch notifications when user changes
  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Mock functions
  const sendMessage = () => {
    console.log('Mock: Message sent');
  };

  const joinRoom = () => {
    console.log('Mock: Joined room');
  };

  const leaveRoom = () => {
    console.log('Mock: Left room');
  };

  const markMessageAsRead = () => {
    console.log('Mock: Message marked as read');
  };

  const getUnreadNotificationsCount = () => {
    return unreadCount;
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await db.notifications.markAsRead(notificationId);
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      // Update unread count
      if (unreadCount > 0) {
        setUnreadCount(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const markAllNotificationsAsRead = async () => {
    if (!user?.id) return;
    try {
      await db.notifications.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const value = {
    isConnected,
    onlineUsers,
    unreadMessages,
    notifications,
    loading,
    sendMessage,
    joinRoom,
    leaveRoom,
    markMessageAsRead,
    getUnreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    refreshNotifications: fetchNotifications,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;


