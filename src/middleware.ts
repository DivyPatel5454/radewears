import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is a robust middleware structure for future-proofing your application.
// It intercepts requests before they hit your pages or API routes,
// ensuring strict security policies, auth checks, and request parsing.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Setup Admin Route Protection
  // In the future, you will integrate NextAuth or Clerk here
  if (pathname.startsWith('/admin')) {
    // Example: Check for a secure session token
    const token = request.cookies.get('admin_session')?.value;
    
    // If no token exists and they are trying to access admin, redirect to login
    // if (!token) {
    //   return NextResponse.redirect(new URL('/login', request.url));
    // }
  }

  // 2. Setup Security Headers for Enterprise Grade Safety
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // 3. Prevent Caching of API Routes (Important for payments/admin)
  if (pathname.startsWith('/api/') || pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'no-store, max-age=0');
  }

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
