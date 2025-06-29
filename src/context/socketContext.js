import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const socket = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      initializeSocket();
    } else {
      disconnectSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, []);

  const initializeSocket = () => {
    if (!socket.current) {
      const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://10.0.175.33:8000';
      
      console.log('🔌 Connecting to socket server:', socketUrl);
      
      socket.current = io(socketUrl, {
        auth: {
          userId: user?.id || user?._id,
          userType: 'shop', // hoặc 'customer'
          storeId: user?.storeId || user?.shopId
        },
        transports: ['websocket'],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      // Connection events
      socket.current.on('connect', () => {
        console.log('✅ Socket connected:', socket.current.id);
        setIsConnected(true);
        
        // Join shop room if applicable
        if (user?.storeId || user?.shopId) {
          socket.current.emit('join_shop_room', {
            shopId: user.storeId || user.shopId,
            userId: user.id || user._id,
            userType: 'shop'
          });
        }
      });

      socket.current.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        setIsConnected(false);
      });

      socket.current.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
      });

      socket.current.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔄 Attempting to reconnect...', attemptNumber);
      });

      socket.current.on('reconnect_failed', () => {
        console.log('❌ Failed to reconnect');
        setIsConnected(false);
      });

      // Online users updates
      socket.current.on('online_users_update', (users) => {
        setOnlineUsers(new Set(users));
      });

      // Error handling
      socket.current.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        setIsConnected(false);
      });

      socket.current.on('error', (error) => {
        console.error('❌ Socket error:', error);
      });

      // Authentication events
      socket.current.on('auth_success', (data) => {
        console.log('✅ Socket authentication successful:', data);
      });

      socket.current.on('auth_error', (error) => {
        console.error('❌ Socket authentication error:', error);
      });
    }
  };

  const disconnectSocket = () => {
    if (socket.current) {
      console.log('🔌 Disconnecting socket...');
      socket.current.disconnect();
      socket.current = null;
      setIsConnected(false);
      setOnlineUsers(new Set());
    }
  };

  const joinConversation = (conversationId) => {
    if (socket.current && isConnected && conversationId) {
      console.log('📝 Joining conversation:', conversationId);
      socket.current.emit('join_conversation', conversationId);
    }
  };

  const leaveConversation = (conversationId) => {
    if (socket.current && isConnected && conversationId) {
      console.log('📝 Leaving conversation:', conversationId);
      socket.current.emit('leave_conversation', conversationId);
    }
  };

  const sendMessage = (conversationId, messageData) => {
    if (socket.current && isConnected && conversationId && messageData) {
      console.log('💬 Sending message to conversation:', conversationId);
      socket.current.emit('send_message', {
        conversationId,
        ...messageData
      });
    }
  };

  const onNewMessage = (callback) => {
    if (socket.current) {
      socket.current.on('new_message', callback);
      
      return () => {
        socket.current.off('new_message', callback);
      };
    }
  };

  const onMessageRead = (callback) => {
    if (socket.current) {
      socket.current.on('message_read', callback);
      
      return () => {
        socket.current.off('message_read', callback);
      };
    }
  };

  const onTyping = (callback) => {
    if (socket.current) {
      socket.current.on('user_typing', callback);
      
      return () => {
        socket.current.off('user_typing', callback);
      };
    }
  };

  const emitTyping = (conversationId, isTyping) => {
    if (socket.current && isConnected && conversationId) {
      socket.current.emit('typing', {
        conversationId,
        isTyping,
        userId: user?.id || user?._id,
        userType: 'shop'
      });
    }
  };

  const markAsRead = (conversationId, messageIds) => {
    if (socket.current && isConnected && conversationId && messageIds) {
      console.log('✓ Marking messages as read:', conversationId);
      socket.current.emit('mark_as_read', {
        conversationId,
        messageIds,
        userId: user?.id || user?._id,
        userType: 'shop'
      });
    }
  };

  const value = {
    socket: socket.current,
    isConnected,
    onlineUsers,
    joinConversation,
    leaveConversation,
    sendMessage,
    onNewMessage,
    onMessageRead,
    onTyping,
    emitTyping,
    markAsRead
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};