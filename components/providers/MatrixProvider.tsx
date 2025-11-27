'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createMatrixClient, MsgType } from '@/lib/matrix/client-only';
import type { MatrixClient, Room, MatrixEvent } from '@/lib/matrix/client-only';

interface MatrixContextType {
    client: MatrixClient | null;
    rooms: Room[];
    isReady: boolean;
    isSyncing: boolean;
    error: string | null;
    unreadCounts: Record<string, number>;
    sendMessage: (roomId: string, message: string) => Promise<{ success: boolean; error?: string }>;
    createRoom: (name: string, topic?: string) => Promise<{ success: boolean; roomId?: string; error?: string }>;
    joinRoom: (roomIdOrAlias: string) => Promise<{ success: boolean; roomId?: string; error?: string }>;
    leaveRoom: (roomId: string) => Promise<{ success: boolean; error?: string }>;
    sendTyping: (roomId: string, isTyping: boolean) => Promise<void>;
    sendReadReceipt: (event: MatrixEvent) => Promise<void>;
    markRoomAsRead: (roomId: string) => void;
    sendReaction: (roomId: string, eventId: string, emoji: string) => Promise<{ success: boolean; error?: string }>;
    removeReaction: (roomId: string, reactionEventId: string) => Promise<{ success: boolean; error?: string }>;
    editMessage: (roomId: string, eventId: string, newContent: string) => Promise<{ success: boolean; error?: string }>;
    uploadFile: (file: File) => Promise<{ success: boolean; mxcUrl?: string; error?: string }>;
    sendImageMessage: (roomId: string, file: File, mxcUrl: string) => Promise<{ success: boolean; error?: string }>;
    sendFileMessage: (roomId: string, file: File, mxcUrl: string) => Promise<{ success: boolean; error?: string }>;
}

const MatrixContext = createContext<MatrixContextType | null>(null);

interface MatrixProviderProps {
    children: React.ReactNode;
    accessToken: string;
    userId: string;
    homeserverUrl?: string;
}

export function MatrixProvider({ children, accessToken, userId, homeserverUrl }: MatrixProviderProps) {
    const [client, setClient] = useState<MatrixClient | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isReady, setIsReady] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const clientRef = useRef<MatrixClient | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

    // Initialize Matrix client
    useEffect(() => {
        if (!accessToken || !userId) return;

        // If client already exists and matches credentials, don't recreate
        if (clientRef.current && clientRef.current.getUserId() === userId) {
            return;
        }

        let matrixClient: MatrixClient | null = null;

        try {
            console.log('Initializing Matrix client with:', { accessToken: accessToken ? '***' : null, userId, homeserverUrl });
            matrixClient = createMatrixClient(accessToken, userId, homeserverUrl);
            clientRef.current = matrixClient;
            setClient(matrixClient);

            // Start client sync with error handling
            matrixClient.startClient({ initialSyncLimit: 10 }).catch((err) => {
                console.error('Failed to start Matrix client:', err);
                setError('Failed to connect to Matrix server');
                setIsSyncing(false);
            });

            // Listen for sync state changes
            matrixClient.on('sync' as any, (state: string, prevState: string | null, data: any) => {
                console.log('Sync state:', state);

                if (state === 'PREPARED') {
                    setIsReady(true);
                    setIsSyncing(true);
                    setError(null);
                    setRooms(matrixClient!.getRooms());
                } else if (state === 'SYNCING') {
                    setIsSyncing(true);
                    setError(null);
                } else if (state === 'ERROR') {
                    setIsSyncing(false);
                    setError('Sync error - retrying...');
                    console.error('Sync error:', data);
                } else if (state === 'RECONNECTING') {
                    setIsSyncing(false);
                } else if (state === 'STOPPED') {
                    setIsSyncing(false);
                }
            });

            // Listen for room updates
            matrixClient.on('Room' as any, () => {
                if (matrixClient) {
                    setRooms(matrixClient.getRooms());
                }
            });

            // Listen for new messages to track unread counts
            matrixClient.on('Room.timeline' as any, (event: MatrixEvent, room: Room) => {
                // Only count messages from others, not our own
                if (event.getSender() !== userId && event.getType() === 'm.room.message') {
                    setUnreadCounts(prev => ({
                        ...prev,
                        [room.roomId]: (prev[room.roomId] || 0) + 1
                    }));
                }
            });

        } catch (err) {
            console.error('Error initializing Matrix client:', err);
            setError('Failed to initialize Matrix client');
        }

        // Cleanup on unmount
        return () => {
            if (matrixClient) {
                try {
                    matrixClient.stopClient();
                    matrixClient.removeAllListeners();
                    clientRef.current = null;
                } catch (err) {
                    console.error('Error cleaning up Matrix client:', err);
                }
            }
        };
    }, [accessToken, userId, homeserverUrl]);

    // Send message to room
    const sendMessage = useCallback(async (roomId: string, message: string) => {
        if (!client) return { success: false, error: 'Client not initialized' };

        try {
            await client.sendTextMessage(roomId, message);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [client]);

    // Create a new room
    const createRoom = useCallback(async (name: string, topic?: string) => {
        if (!client) return { success: false, error: 'Client not initialized' };

        try {
            const room = await client.createRoom({
                name,
                topic,
                visibility: 'private' as any,
            });
            return { success: true, roomId: room.room_id };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [client]);

    // Join a room
    const joinRoom = useCallback(async (roomIdOrAlias: string) => {
        if (!client) return { success: false, error: 'Client not initialized' };

        try {
            const room = await client.joinRoom(roomIdOrAlias);
            return { success: true, roomId: room.roomId };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [client]);

    // Leave a room
    const leaveRoom = useCallback(async (roomId: string) => {
        if (!client) return { success: false, error: 'Client not initialized' };

        try {
            await client.leave(roomId);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [client]);

    // Send typing notification
    const sendTyping = useCallback(async (roomId: string, isTyping: boolean) => {
        if (!client) return;

        try {
            await client.sendTyping(roomId, isTyping, isTyping ? 3000 : 0);
        } catch (error) {
            console.error('Failed to send typing notification:', error);
        }
    }, [client]);

    // Send read receipt
    const sendReadReceipt = useCallback(async (event: MatrixEvent) => {
        if (!client) return;

        try {
            await client.sendReadReceipt(event);
        } catch (error) {
            console.error('Failed to send read receipt:', error);
        }
    }, [client]);

    // Mark room as read (reset unread count)
    const markRoomAsRead = useCallback((roomId: string) => {
        setUnreadCounts(prev => ({
            ...prev,
            [roomId]: 0
        }));
    }, []);

    // Send reaction to a message
    const sendReaction = useCallback(async (roomId: string, eventId: string, emoji: string) => {
        if (!client) return { success: false, error: 'Client not initialized' };

        try {
            await client.sendEvent(roomId, 'm.reaction' as any, {
                'm.relates_to': {
                    rel_type: 'm.annotation',
                    event_id: eventId,
                    key: emoji
                }
            });
            return { success: true };
        } catch (error: any) {
            console.error('Failed to send reaction:', error);
            return { success: false, error: error.message };
        }
    }, [client]);

    // Remove reaction from a message
    const removeReaction = useCallback(async (roomId: string, reactionEventId: string) => {
        if (!client) return { success: false, error: 'Client not initialized' };

        try {
            await client.redactEvent(roomId, reactionEventId);
            return { success: true };
        } catch (error: any) {
            console.error('Failed to remove reaction:', error);
            return { success: false, error: error.message };
        }
    }, [client]);

    // Edit a message
    const editMessage = useCallback(async (roomId: string, eventId: string, newContent: string) => {
        if (!client) return { success: false, error: 'Client not initialized' };

        try {
            await client.sendEvent(roomId, 'm.room.message' as any, {
                'body': ` * ${newContent}`,
                'msgtype': 'm.text',
                'm.new_content': {
                    'body': newContent,
                    'msgtype': 'm.text'
                },
                'm.relates_to': {
                    'rel_type': 'm.replace',
                    'event_id': eventId
                }
            });
            return { success: true };
        } catch (error: any) {
            console.error('Failed to edit message:', error);
            return { success: false, error: error.message };
        }
    }, [client]);

    // Upload file to Matrix media repository
    const uploadFile = useCallback(async (file: File) => {
        if (!client) return { success: false, error: 'Client not initialized' };

        try {
            const response = await client.uploadContent(file, {
                name: file.name,
                type: file.type,
            });
            return { success: true, mxcUrl: response.content_uri };
        } catch (error: any) {
            console.error('Failed to upload file:', error);
            return { success: false, error: error.message };
        }
    }, [client]);

    // Send image message
    const sendImageMessage = useCallback(async (roomId: string, file: File, mxcUrl: string) => {
        if (!client) return { success: false, error: 'Client not initialized' };

        try {
            await client.sendMessage(roomId, {
                msgtype: MsgType.Image,
                body: file.name,
                url: mxcUrl,
                info: {
                    size: file.size,
                    mimetype: file.type,
                },
            });
            return { success: true };
        } catch (error: any) {
            console.error('Failed to send image:', error);
            return { success: false, error: error.message };
        }
    }, [client]);

    // Send file message
    const sendFileMessage = useCallback(async (roomId: string, file: File, mxcUrl: string) => {
        if (!client) return { success: false, error: 'Client not initialized' };

        try {
            await client.sendMessage(roomId, {
                msgtype: MsgType.File,
                body: file.name,
                url: mxcUrl,
                info: {
                    size: file.size,
                    mimetype: file.type,
                },
            });
            return { success: true };
        } catch (error: any) {
            console.error('Failed to send file:', error);
            return { success: false, error: error.message };
        }
    }, [client]);

    const value = {
        client,
        rooms,
        isReady,
        isSyncing,
        error,
        unreadCounts,
        sendMessage,
        createRoom,
        joinRoom,
        leaveRoom,
        sendTyping,
        sendReadReceipt,
        markRoomAsRead,
        sendReaction,
        removeReaction,
        editMessage,
        uploadFile,
        sendImageMessage,
        sendFileMessage,
    };

    return (
        <MatrixContext.Provider value={value}>
            {children}
        </MatrixContext.Provider>
    );
}

export function useMatrixContext() {
    const context = useContext(MatrixContext);
    if (!context) {
        throw new Error('useMatrixContext must be used within a MatrixProvider');
    }
    return context;
}
