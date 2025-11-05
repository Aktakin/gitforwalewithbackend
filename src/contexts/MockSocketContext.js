import React, { createContext, useContext, useState, useEffect } from 'react';

const SocketContext = createContext({});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  // Mock socket connection data
  const [isConnected, setIsConnected] = useState(true); // Always connected in mock mode
  const [unreadMessages, setUnreadMessages] = useState([]);

  // Mock online users
  const [onlineUsers] = useState([
    { id: 'user123', name: 'John Doe', status: 'online' },
    { id: 'user456', name: 'Jane Smith', status: 'online' },
    { id: 'user789', name: 'Mike Johnson', status: 'away' }
  ]);

  // Mock functions
  const sendMessage = async (message) => {
    console.log('Mock: Sending message', message);
    // Simulate message sending
    return { success: true, messageId: Date.now() };
  };

  const joinRoom = (roomId) => {
    console.log('Mock: Joining room', roomId);
  };

  const leaveRoom = (roomId) => {
    console.log('Mock: Leaving room', roomId);
  };

  const markMessageAsRead = (messageId) => {
    setUnreadMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );
  };

  const getUnreadNotificationsCount = () => {
    return 2; // Mock count
  };

  const emitNotification = (notification) => {
    console.log('Mock: Emitting notification', notification);
  };

  const subscribeToNotifications = (callback) => {
    console.log('Mock: Subscribing to notifications');
    // Mock some notifications
    setTimeout(() => {
      callback({
        type: 'new_message',
        data: { message: 'You have a new message!' }
      });
    }, 5000);
  };

  const unsubscribeFromNotifications = () => {
    console.log('Mock: Unsubscribing from notifications');
  };

  // Mock effect to simulate real-time updates
  useEffect(() => {
    // Simulate connection status changes
    const interval = setInterval(() => {
      // Random connection status for demo (mostly connected)
      setIsConnected(Math.random() > 0.1); // 90% connected
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const value = {
    // Connection status
    isConnected,
    
    // Messages
    unreadMessages,
    sendMessage,
    markMessageAsRead,
    
    // Rooms
    joinRoom,
    leaveRoom,
    
    // Users
    onlineUsers,
    
    // Notifications
    getUnreadNotificationsCount,
    emitNotification,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    
    // Mock socket instance (for compatibility)
    socket: {
      connected: isConnected,
      emit: (event, data) => console.log('Mock emit:', event, data),
      on: (event, callback) => console.log('Mock on:', event),
      off: (event, callback) => console.log('Mock off:', event)
    }
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
