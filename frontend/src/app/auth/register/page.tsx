'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { showToast } from '@/redux/slices/uiSlice';
import { Mail, Lock, User, UserPlus, Loader } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'seeker' | 'employer'>('seeker');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    try {
      const res = await fetch(`${backendUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error?.message || 'Registration failed');
      }

      dispatch(
        showToast({
          message: 'Account created successfully! Please sign in.',
          type: 'success',
        })
      );
      router.push('/auth/login');
    } catch (err: any) {
      dispatch(showToast({ message: err.message || 'Something went wrong', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-container card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join WorkHive to discover or post premium jobs</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="form-input-wrapper">
              <span className="form-input-icon">
                <Mail size={18} />
              </span>
              <input
                id="register-email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          {/* Account Role */}
          <div className="form-group">
            <label className="form-label">Account Role</label>
            <div className="form-input-wrapper">
              <span className="form-input-icon">
                <User size={18} />
              </span>
              <select
                id="register-role"
                className="form-control"
                style={{ appearance: 'none', cursor: 'pointer' }}
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
              >
                <option value="seeker">Job Seeker (Browse &amp; Apply)</option>
                <option value="employer">Employer (Post &amp; Manage)</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-wrapper">
              <span className="form-input-icon">
                <Lock size={18} />
              </span>
              <input
                id="register-password"
                type="password"
                className="form-control"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="form-input-wrapper">
              <span className="form-input-icon">
                <Lock size={18} />
              </span>
              <input
                id="register-confirm-password"
                type="password"
                className="form-control"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {errors.confirmPassword && (
              <span className="form-error">{errors.confirmPassword}</span>
            )}
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
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Create Account
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
