'use client';

import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { RootState } from '@/redux/store';
import { showToast } from '@/redux/slices/uiSlice';

export function useSocket() {
  const dispatch = useDispatch();
  const { user, status } = useSelector((state: RootState) => state.auth);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only connect when user is authenticated
    if (status !== 'authenticated' || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    // Remove the '/api/v1' suffix to get the root Socket server URL
    const socketUrl = backendApiUrl.replace(/\/api\/v1\/?$/, '');

    console.log(`[Socket] Connecting to ${socketUrl} for user ${user.id}`);

    const socket = io(socketUrl, {
      query: {
        userId: user.id,
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected to server.');
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err);
    });

    // Listen for push notifications from backend
    socket.on('notification', (data: { message: string }) => {
      console.log('[Socket] Notification received:', data);
      dispatch(
        showToast({
          message: data.message,
          type: 'info',
        })
      );
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        console.log('[Socket] Disconnected cleanup.');
      }
    };
  }, [user, status, dispatch]);
}
