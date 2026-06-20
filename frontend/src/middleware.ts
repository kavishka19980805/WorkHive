import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET || 'nextauth_super_secret_key_987654!';
  const token = await getToken({ req, secret });
  const { pathname } = req.nextUrl;

  const isAuth = !!token;
  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/employer') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/apply');

  // 1. Redirect to login if accessing protected path without session
  if (isProtectedPath && !isAuth) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user role validation
  if (isAuth) {
    const role = token.role;

    // Seeker trying to access employer pages
    if (pathname.startsWith('/employer') && role !== 'employer') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Employer trying to access seeker dashboard or apply pages
    if ((pathname.startsWith('/dashboard') || pathname.startsWith('/apply')) && role !== 'seeker') {
      return NextResponse.redirect(new URL('/employer/jobs', req.url));
    }

    // Non-admin trying to access admin pages
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Authenticated users trying to access login/register
    if (pathname.startsWith('/auth/')) {
      if (role === 'employer') {
        return NextResponse.redirect(new URL('/employer/jobs', req.url));
      } else if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url));
      } else {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/employer/:path*',
    '/admin/:path*',
    '/apply/:path*',
    '/auth/:path*',
  ],
};
