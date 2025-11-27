/**
 * Matrix Client Factory
 * Creates and manages Matrix SDK client instances
 * NOTE: This file should only be imported in CLIENT components
 */

'use client';

import './fix-entrypoint';
import { createClient, MsgType } from 'matrix-js-sdk';
import type { MatrixClient, Room, MatrixEvent, IEvent, RoomMember } from 'matrix-js-sdk';

export { MsgType };
export type { MatrixClient, Room, MatrixEvent, IEvent, RoomMember };

/**
 * Create a new Matrix client instance
 * @param accessToken - Optional access token for authenticated sessions
 * @param userId - Optional user ID for authenticated sessions
 * @param homeserverUrl - Optional homeserver URL override
 */
export function createMatrixClient(accessToken: string, userId: string, homeserverUrl?: string): MatrixClient {
    const baseUrl = homeserverUrl || process.env.NEXT_PUBLIC_MATRIX_HOMESERVER_URL || 'https://matrix.org';

    const client = createClient({
        baseUrl,
        accessToken,
        userId,
    });

    return client;
}
