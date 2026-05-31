import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth';

const SOCKET_URL = (import.meta.env.VITE_API_URL as string || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

export const useSocket = (
  eventHandlers?: Record<string, (...args: any[]) => void>,
) => {
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) {
      console.log('[Socket] No token, skipping connection');
      return;
    }

    console.log('[Socket] Connecting to', SOCKET_URL);

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected');
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    if (eventHandlers) {
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        console.log('[Socket] Registering handler for', event);
        socket.on(event, (...args: any[]) => {
          console.log('[Socket] Received event:', event, args);
          handler(...args);
        });
      });
    }

    socketRef.current = socket;

    return () => {
      console.log('[Socket] Disconnecting');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return socketRef;
};
