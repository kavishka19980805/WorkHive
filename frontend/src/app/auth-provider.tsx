'use client';

import React, { useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { setCredentials, clearCredentials, setAuthStatus } from '@/redux/slices/authSlice';
import { useSocket } from '@/hooks/useSocket';

function SessionSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  // Initialize socket listener for push notifications
  useSocket();

  useEffect(() => {
    if (status === 'loading') {
      dispatch(setAuthStatus('loading'));
    } else if (status === 'authenticated' && session) {
      dispatch(
        setCredentials({
          user: session.user as any,
          token: (session as any).accessToken || '',
        })
      );
    } else {
      dispatch(clearCredentials());
    }
  }, [session, status, dispatch]);

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionSync>{children}</SessionSync>
    </SessionProvider>
  );
}
