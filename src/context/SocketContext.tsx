import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
  joinTrip: (tripId: string) => void;
  leaveTrip: (tripId: string) => void;
  sendMessage: (tripId: string, content: string) => void;
  typing: (tripId: string) => void;
  stopTyping: (tripId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { token, user } = useAuth();

  useEffect(() => {
    if (token && user) {
      const newSocket = io(SOCKET_URL, {
        auth: {
          token
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setSocket(newSocket);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setSocket(null);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        toast.error('Failed to connect to chat server');
      });

      newSocket.on('new-message', (message) => {
        // This will be handled by individual chat components
        window.dispatchEvent(new CustomEvent('new-message', { detail: message }));
      });

      newSocket.on('user-typing', (data) => {
        window.dispatchEvent(new CustomEvent('user-typing', { detail: data }));
      });

      newSocket.on('user-stop-typing', (data) => {
        window.dispatchEvent(new CustomEvent('user-stop-typing', { detail: data }));
      });

      newSocket.on('message-error', (error) => {
        toast.error(error.error);
      });

      return () => {
        newSocket.close();
      };
    }
  }, [token, user]);

  const joinTrip = (tripId: string) => {
    if (socket) {
      socket.emit('join-trip', tripId);
    }
  };

  const leaveTrip = (tripId: string) => {
    if (socket) {
      socket.emit('leave-trip', tripId);
    }
  };

  const sendMessage = (tripId: string, content: string) => {
    if (socket) {
      socket.emit('send-message', { tripId, content });
    }
  };

  const typing = (tripId: string) => {
    if (socket) {
      socket.emit('typing', { tripId });
    }
  };

  const stopTyping = (tripId: string) => {
    if (socket) {
      socket.emit('stop-typing', { tripId });
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      onlineUsers,
      joinTrip,
      leaveTrip,
      sendMessage,
      typing,
      stopTyping
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};