import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { ReduxProvider } from '@/redux/provider';
import { AuthProvider } from './auth-provider';
import Navbar from '@/components/Navbar';
import ToastContainer from '@/components/ToastContainer';

export const metadata: Metadata = {
  title: 'WorkHive - Premium Job Board Platform',
  description:
    'Browse job listings, search & filter by location and category, and apply with ease. WorkHive connects top talent with premium employers.',
  keywords: 'jobs, recruitment, hire developers, work, resume, careers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <AuthProvider>
            <Navbar />
            <main className="main-content">{children}</main>
            
            {/* Premium Jobenvoy Style Footer */}
            <footer className="footer">
              <div className="container">
                <div className="footer-grid">
                  <div className="footer-column" style={{ maxWidth: '340px' }}>
                    <div className="footer-logo">
                      Work<span>Hive</span>
                    </div>
                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#94a3b8', marginTop: '12px' }}>
                      WorkHive is a premium full-stack job board connecting top global talent with leading partners. Fully optimized, secure, and authenticated.
                    </p>
                  </div>
                  <div className="footer-column">
                    <h3>For Seekers</h3>
                    <ul className="footer-links">
                      <li><Link href="/">Browse Jobs</Link></li>
                      <li><Link href="/dashboard">My Applications</Link></li>
                    </ul>
                  </div>
                  <div className="footer-column">
                    <h3>For Employers</h3>
                    <ul className="footer-links">
                      <li><Link href="/employer/post">Post a Job</Link></li>
                      <li><Link href="/employer/jobs">Manage Listings</Link></li>
                    </ul>
                  </div>
                  <div className="footer-column">
                    <h3>Moderation</h3>
                    <ul className="footer-links">
                      <li><Link href="/admin">Admin Panel</Link></li>
                      <li><Link href="#">Terms & Conditions</Link></li>
                    </ul>
                  </div>
                </div>
                <div className="footer-bottom">
                  <p>&copy; {new Date().getFullYear()} ORYSYS. All rights reserved.</p>
                </div>
              </div>
            </footer>

            <ToastContainer />
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
