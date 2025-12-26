import { NextResponse } from 'next/server';

/**
 * Lightweight Admin Page Protection
 * - ONLY checks if auth cookie exists (no JWT verification)
 * - Redirects to login if cookie missing
 * - All security validation happens in API routes (Node.js runtime)
 */
export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Allow access to login page
    if (pathname === '/admin/login') {
        return NextResponse.next();
    }

    // Extract token cookie (NO verification, just check existence)
    const cookieHeader = request.headers.get('cookie');
    const hasToken = cookieHeader?.includes('token=');

    // No token → redirect to login
    if (!hasToken) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Token exists → allow request (API routes will validate)
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'], // Only protect admin pages, not API routes
};
