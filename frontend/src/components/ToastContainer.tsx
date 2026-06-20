'use client';

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { removeToast } from '@/redux/slices/uiSlice';

export default function ToastContainer() {
  const toasts = useSelector((state: RootState) => state.ui.toasts);
  const dispatch = useDispatch();

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        return (
          <ToastItem
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={(id) => dispatch(removeToast(id))}
          />
        );
      })}
    </div>
  );
}

interface ToastItemProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: (id: string) => void;
}

function ToastItem({ id, message, type, onClose }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button
        style={{
          background: 'none',
          border: 'none',
          color: '#ffffff',
          marginLeft: '12px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
        onClick={() => onClose(id)}
      >
        &times;
      </button>
    </div>
  );
}
