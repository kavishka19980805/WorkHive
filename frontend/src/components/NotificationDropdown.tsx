'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Circle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { io, Socket } from 'socket.io-client';
import { showToast } from '@/redux/slices/uiSlice';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationDropdownProps {
  isTransparent?: boolean;
}

export default function NotificationDropdown({ isTransparent = false }: NotificationDropdownProps) {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    // Close dropdown on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!token || !userId) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${backendUrl}/notifications`, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success && data.data) {
          setNotifications(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    fetchNotifications();

    // Setup Socket.io
    const socketUrl = backendUrl.replace('/api/v1', '');
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    socket.emit('join', userId);

    socket.on('application_notification', (data: { message: string; timestamp?: string }) => {
      // Optimistically add notification
      const newNotification: Notification = {
        id: `temp-${Date.now()}`, // Temporary ID until fetched or just for display
        message: data.message,
        read: false,
        createdAt: data.timestamp || new Date().toISOString(),
      };
      
      setNotifications((prev) => [newNotification, ...prev]);
      
      // Also show a toast so they don't miss it
      dispatch(showToast({ message: data.message, type: 'info' }));
      
      // Re-fetch to get real DB IDs so marking as read works perfectly
      fetchNotifications();
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [token, userId, backendUrl, dispatch]);

  const markAsRead = async (id: string) => {
    if (id.startsWith('temp-')) return; // Wait for real ID to be fetched
    
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      await fetch(`${backendUrl}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    unread.forEach(n => markAsRead(n.id));
  };

  return (
    <div className="nav-item-relative" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        className="nav-link" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          position: 'relative', 
          display: 'flex', 
          alignItems: 'center', 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          color: isTransparent ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)' 
        }}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            borderRadius: '50%',
            fontSize: '9px',
            minWidth: '14px',
            height: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 3px',
            fontWeight: 'bold'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '-20px',
          marginTop: '10px',
          width: '320px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          border: '1px solid var(--border-light)',
          zIndex: 1000,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '400px'
        }}>
          <div style={{
            padding: '16px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-light)'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                style={{ fontSize: '12px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Bell size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '14px' }}>No notifications yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => markAsRead(n.id)}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid var(--border-light)',
                      display: 'flex',
                      gap: '12px',
                      cursor: n.read ? 'default' : 'pointer',
                      backgroundColor: n.read ? 'white' : 'rgba(74, 182, 85, 0.05)',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <div style={{ marginTop: '2px' }}>
                      {n.read ? (
                        <Check size={16} color="var(--text-muted)" />
                      ) : (
                        <Circle size={12} fill="var(--primary)" color="var(--primary)" style={{ marginTop: '2px' }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ 
                        margin: '0 0 4px 0', 
                        fontSize: '14px', 
                        color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)',
                        lineHeight: '1.4'
                      }}>
                        {n.message}
                      </p>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
