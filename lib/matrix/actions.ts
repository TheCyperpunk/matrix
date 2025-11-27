/**
 * Server Actions for Authentication
 */

'use server';

import { redirect } from 'next/navigation';
import { loginToMatrix, registerOnMatrix, logoutFromMatrix } from './server-auth';
import { setSessionCookie, getSession, deleteSession } from './session';

export async function loginAction(prevState: any, formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
        return { success: false, error: 'Username and password are required' };
    }

    const result = await loginToMatrix(username, password);

    if (result.success && result.accessToken && result.userId) {
        await setSessionCookie({
            accessToken: result.accessToken,
            userId: result.userId,
            deviceId: result.deviceId,
            homeServer: result.homeServer,
        });

        // Return success - redirect will be handled client-side
        return { success: true };
    }

    return result;
}

export async function signupAction(prevState: any, formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!username || !password) {
        return { success: false, error: 'Username and password are required' };
    }

    if (password !== confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
    }

    const result = await registerOnMatrix(username, password);

    if (result.success && result.accessToken && result.userId) {
        await setSessionCookie({
            accessToken: result.accessToken,
            userId: result.userId,
            deviceId: result.deviceId,
            homeServer: result.homeServer,
        });

        // Return success - redirect will be handled client-side
        return { success: true };
    }

    return result;
}

export async function logoutAction() {
    const session = await getSession();

    if (session) {
        await logoutFromMatrix(session.accessToken);
        await deleteSession();
    }

    redirect('/login');
}

export async function getCurrentSession() {
    return await getSession();
}
