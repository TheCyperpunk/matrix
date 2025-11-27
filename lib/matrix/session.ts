/**
 * Session Management using JWT and HttpOnly Cookies
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SESSION_SECRET = new TextEncoder().encode(
    process.env.SESSION_SECRET || 'fallback-secret-key-change-in-production'
);
const SESSION_COOKIE_NAME = 'matrix-session';

export interface SessionData {
    accessToken: string;
    userId: string;
    deviceId?: string;
    homeServer?: string;
}

/**
 * Create a session token
 */
export async function createSession(data: SessionData): Promise<string> {
    const token = await new SignJWT(data)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d') // 7 days expiration
        .sign(SESSION_SECRET);

    return token;
}

/**
 * Verify and decode session token
 */
export async function verifySession(token: string): Promise<SessionData | null> {
    try {
        const { payload } = await jwtVerify(token, SESSION_SECRET);
        return payload as unknown as SessionData;
    } catch (error) {
        return null;
    }
}

/**
 * Set session cookie
 */
export async function setSessionCookie(data: SessionData) {
    const token = await createSession(data);
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
}

/**
 * Get session from cookie
 */
export async function getSession(): Promise<SessionData | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie) {
        return null;
    }

    return verifySession(sessionCookie.value);
}

/**
 * Delete session cookie
 */
export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}
