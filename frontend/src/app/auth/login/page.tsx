'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { showToast } from '@/redux/slices/uiSlice';
import { Lock, Mail, Loader } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        dispatch(showToast({ message: res.error, type: 'error' }));
      } else {
        dispatch(showToast({ message: 'Welcome back to WorkHive!', type: 'success' }));
        window.location.href = callbackUrl;
      }
    } catch (err: any) {
      dispatch(showToast({ message: err.message || 'Something went wrong', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container card">
      <div className="auth-header">
        <h1>Welcome Back</h1>
        <p>Sign in to your WorkHive account to continue</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Email field */}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="form-input-wrapper">
            <span className="form-input-icon">
              <Mail size={18} />
            </span>
            <input
              id="login-email"
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        {/* Password field */}
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="form-input-wrapper">
            <span className="form-input-icon">
              <Lock size={18} />
            </span>
            <input
              id="login-password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '8px', gap: '8px' }}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader size={18} className="loader" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)' }}>
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>
          Register here
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="container">
      <Suspense fallback={
        <div className="auth-container card" style={{ textAlign: 'center', padding: '48px' }}>
          <Loader size={32} className="loader" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading sign-in form...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
