/**
 * Middleware for protecting authenticated routes
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/matrix/session';

const publicRoutes = ['/login', '/signup'];
const protectedRoutes = ['/chat', '/profile'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get session cookie
    const sessionCookie = request.cookies.get('matrix-session');
    const session = sessionCookie ? await verifySession(sessionCookie.value) : null;

    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isPublicRoute = publicRoutes.some(route => pathname === route);

    // Redirect to login if accessing protected route without session
    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect to chat if accessing public route with valid session
    if (isPublicRoute && session) {
        return NextResponse.redirect(new URL('/chat', request.url));
    }

    // Redirect root to appropriate page
    if (pathname === '/') {
        if (session) {
            return NextResponse.redirect(new URL('/chat', request.url));
        } else {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/login', '/signup', '/chat/:path*', '/profile/:path*'],
};
