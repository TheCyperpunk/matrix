/**
 * Server-side Matrix Authentication
 * Uses fetch API instead of matrix-js-sdk to avoid multiple entrypoints
 */

const HOMESERVER_URL = process.env.NEXT_PUBLIC_MATRIX_HOMESERVER_URL || 'https://matrix.org';

/**
 * Login to Matrix server using REST API
 * @param username - Matrix username (without @)
 * @param password - User password
 */
export async function loginToMatrix(username: string, password: string) {
    try {
        const response = await fetch(`${HOMESERVER_URL}/_matrix/client/v3/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'm.login.password',
                identifier: {
                    type: 'm.id.user',
                    user: username,
                },
                password: password,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                error: error.error || 'Login failed',
            };
        }

        const data = await response.json();

        return {
            success: true,
            accessToken: data.access_token,
            userId: data.user_id,
            deviceId: data.device_id,
            homeServer: HOMESERVER_URL, // Return the URL, not the server name
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Login failed',
        };
    }
}

/**
 * Register a new user on Matrix server using REST API
 * @param username - Desired username (without @)
 * @param password - User password
 */
export async function registerOnMatrix(username: string, password: string) {
    try {
        const response = await fetch(`${HOMESERVER_URL}/_matrix/client/v3/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
                auth: {
                    type: 'm.login.dummy',
                },
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                error: error.error || 'Registration failed',
            };
        }

        const data = await response.json();

        return {
            success: true,
            accessToken: data.access_token,
            userId: data.user_id,
            deviceId: data.device_id,
            homeServer: HOMESERVER_URL, // Return the URL, not the server name
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Registration failed',
        };
    }
}

/**
 * Logout from Matrix server using REST API
 * @param accessToken - Current access token
 */
export async function logoutFromMatrix(accessToken: string) {
    try {
        const response = await fetch(`${HOMESERVER_URL}/_matrix/client/v3/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            return { success: false, error: 'Logout failed' };
        }

        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Logout failed',
        };
    }
}
