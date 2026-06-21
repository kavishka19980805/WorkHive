'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Briefcase, LogOut, User, PlusCircle, Shield, List, Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, status } = useSelector((state: RootState) => state.auth);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/login' });
  };

  const isHome = pathname === '/';
  const isTransparent = isHome && !isScrolled && !menuOpen;
  const isActive = (path: string) => pathname === path;

  return (
    <nav className={`navbar ${isTransparent ? 'navbar-transparent' : ''}`}>
      <div className="container navbar-container">
        <Link href="/" className="logo">
          <Briefcase size={28} style={{ stroke: 'url(#brand-gradient)' }} />
          <span>WorkHive</span>
          {/* SVG gradient definition for the icon */}
          <svg width="0" height="0">
            <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d65bb" />
              <stop offset="100%" stopColor="#4ab655" />
            </linearGradient>
          </svg>
        </Link>

        {/* Hamburger button - mobile only */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Nav links */}
        <ul className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}>
          <li>
            <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              Browse Jobs
            </Link>
          </li>

          {status === 'loading' ? (
            <li className="nav-link animate-pulse">Syncing...</li>
          ) : user ? (
            <>
              {/* Seeker Navigation */}
              {user.role === 'seeker' && (
                <li>
                  <Link
                    href="/dashboard"
                    className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                  >
                    My Applications
                  </Link>
                </li>
              )}

              {/* Employer Navigation */}
              {user.role === 'employer' && (
                <>
                  <li>
                    <Link
                      href="/employer/post"
                      className={`nav-link ${isActive('/employer/post') ? 'active' : ''}`}
                    >
                      <PlusCircle size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                      Post Job
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/employer/jobs"
                      className={`nav-link ${isActive('/employer/jobs') ? 'active' : ''}`}
                    >
                      <List size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                      My Postings
                    </Link>
                  </li>
                </>
              )}

              {/* Admin Navigation */}
              {user.role === 'admin' && (
                <li>
                  <Link
                    href="/admin"
                    className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                  >
                    <Shield size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    Moderation Panel
                  </Link>
                </li>
              )}

              <li className="nav-user-row">
                <span
                  className="nav-user-label"
                  style={{ color: isTransparent ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)' }}
                >
                  <User size={14} />
                  {user.email.split('@')[0]} ({user.role})
                </span>
                <button onClick={handleSignOut} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LogOut size={14} />
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  href="/auth/login"
                  className={`nav-link ${isActive('/auth/login') ? 'active' : ''}`}
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
