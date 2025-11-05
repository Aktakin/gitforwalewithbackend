import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
// import io from 'socket.io-client';
// import { toast } from 'react-toastify';
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

// Socket Provider Component
export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const socket = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Connect to socket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user]);

  // Connect socket (mocked for deployment)
  const connectSocket = () => {
    if (socket.current?.connected) return;

    // Mock connection for deployment without backend
    setIsConnected(true);
    
    /*
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('skillbridge_token='))
      ?.split('=')[1];

    if (!token) return;

    socket.current = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
    });

    // Connection events
    socket.current.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socket.current.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      setIsConnected(false);
    });

    socket.current.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    // User presence events
    socket.current.on('userOnline', (data) => {
      setOnlineUsers(prev => new Set([...prev, data.userId]));
    });

    socket.current.on('userOffline', (data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    // Message events
    socket.current.on('newMessage', (data) => {
      // Handle new message received
      setUnreadMessages(prev => prev + 1);
      
      // Show notification if not on messages page
      if (!window.location.pathname.includes('/messages')) {
        toast.info(`New message from ${data.message.sender.firstName}`);
      }
    });

    socket.current.on('newMessageNotification', (data) => {
      setUnreadMessages(prev => prev + 1);
      
      // Show toast notification
      toast.info(`${data.senderName}: ${data.messagePreview}`, {
        onClick: () => {
          window.location.href = `/messages/${data.senderId}`;
        },
      });
    });

    socket.current.on('messageRead', (data) => {
      // Handle message read receipt
    });

    socket.current.on('messageDeleted', (data) => {
      // Handle message deletion
    });

    socket.current.on('messageEdited', (data) => {
      // Handle message edit
    });

    // Typing events
    socket.current.on('userTyping', (data) => {
      // Handle typing indicator
    });

    // Request/Proposal events
    socket.current.on('newRequestAlert', (data) => {
      if (user?.userType === 'provider' || user?.userType === 'both') {
        toast.info(`New ${data.category} request: ${data.title}`, {
          onClick: () => {
            window.location.href = `/requests/${data.requestId}`;
          },
        });
      }
    });

    socket.current.on('newProposalNotification', (data) => {
      toast.success(`New proposal for "${data.requestTitle}"`, {
        onClick: () => {
          window.location.href = `/requests/${data.requestId}`;
        },
      });
      
      addNotification({
        id: Date.now(),
        type: 'proposal',
        title: 'New Proposal',
        message: `${data.provider.name} submitted a proposal for "${data.requestTitle}"`,
        data: data,
        timestamp: new Date(),
        read: false,
      });
    });

    socket.current.on('proposalDecisionNotification', (data) => {
      const message = data.decision === 'accepted' 
        ? `Your proposal for "${data.requestTitle}" was accepted!`
        : `Your proposal for "${data.requestTitle}" was rejected.`;
      
      toast[data.decision === 'accepted' ? 'success' : 'info'](message);
      
      addNotification({
        id: Date.now(),
        type: 'proposal_decision',
        title: `Proposal ${data.decision}`,
        message: message,
        data: data,
        timestamp: new Date(),
        read: false,
      });
    });

    // Review events
    socket.current.on('newReviewNotification', (data) => {
      toast.success(`New ${data.rating}-star review for "${data.skillTitle}"`);
      
      addNotification({
        id: Date.now(),
        type: 'review',
        title: 'New Review',
        message: `${data.reviewer.name} left a ${data.rating}-star review for "${data.skillTitle}"`,
        data: data,
        timestamp: new Date(),
        read: false,
      });
    });

    // General notifications
    socket.current.on('notification', (data) => {
      toast.info(data.message);
      
      addNotification({
        id: Date.now(),
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data,
        timestamp: new Date(),
        read: false,
      });
    });

    // Error handling
    socket.current.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error('Connection error occurred');
    });
  };

  // Disconnect socket
  const disconnectSocket = () => {
    if (socket.current) {
      socket.current.disconnect();
      socket.current = null;
      setIsConnected(false);
      setOnlineUsers(new Set());
    }
  };

  // Add notification to state
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50 notifications
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Socket utility functions
  const joinConversation = (otherUserId) => {
    if (socket.current?.connected) {
      socket.current.emit('joinConversation', { otherUserId });
    }
  };

  const leaveConversation = () => {
    if (socket.current?.connected) {
      socket.current.emit('leaveConversation');
    }
  };

  const sendMessage = (recipientId, message) => {
    if (socket.current?.connected) {
      socket.current.emit('sendMessage', { recipientId, message });
    }
  };

  const sendTypingIndicator = (recipientId, isTyping) => {
    if (socket.current?.connected) {
      socket.current.emit('typing', { recipientId, isTyping });
    }
  };

  const markAsRead = (messageId, senderId) => {
    if (socket.current?.connected) {
      socket.current.emit('markAsRead', { messageId, senderId });
    }
  };

  const notifyNewRequest = (requestData) => {
    if (socket.current?.connected) {
      socket.current.emit('notifyNewRequest', requestData);
    }
  };

  const notifyProposalSubmitted = (data) => {
    if (socket.current?.connected) {
      socket.current.emit('notifyProposalSubmitted', data);
    }
  };

  const notifyProposalDecision = (data) => {
    if (socket.current?.connected) {
      socket.current.emit('notifyProposalDecision', data);
    }
  };

  const notifyNewReview = (data) => {
    if (socket.current?.connected) {
      socket.current.emit('notifyNewReview', data);
    }
  };

  const sendNotification = (recipientId, type, title, message, data = {}) => {
    if (socket.current?.connected) {
      socket.current.emit('sendNotification', {
        recipientId,
        type,
        title,
        message,
        data,
      });
    }
  };

  // Check if user is online
  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  // Get unread notifications count
  const getUnreadNotificationsCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  const value = {
    socket: socket.current,
    isConnected,
    onlineUsers,
    unreadMessages,
    setUnreadMessages,
    notifications,
    
    // Utility functions
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTypingIndicator,
    markAsRead,
    notifyNewRequest,
    notifyProposalSubmitted,
    notifyProposalDecision,
    notifyNewReview,
    sendNotification,
    isUserOnline,
    
    // Notification functions
    markNotificationAsRead,
    clearNotifications,
    getUnreadNotificationsCount,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

