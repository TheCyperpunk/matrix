/**
 * Individual Room Page
 * Displays messages for a specific room
 */

'use client';

import { use, useState, useEffect } from 'react';
import { useMatrixClient } from '@/hooks/useMatrixClient';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import MemberList from '@/components/chat/MemberList';
import RoomInfo from '@/components/chat/RoomInfo';

interface RoomPageProps {
    params: Promise<{ roomId: string }>;
    session: {
        accessToken: string;
        userId: string;
    };
}

export default function RoomPageClient({ params, session }: RoomPageProps) {
    const { roomId: rawRoomId } = use(params);
    const roomId = decodeURIComponent(rawRoomId);

    const {
        client,
        rooms,
        isReady,
        isSyncing,
        sendMessage,
        sendTyping,
        leaveRoom,
        joinRoom,
        markRoomAsRead,
        sendReaction,
        removeReaction,
        editMessage,
        uploadFile,
        sendImageMessage,
        sendFileMessage,
    } = useMatrixClient({
        accessToken: session.accessToken,
        userId: session.userId,
    });

    const [isLeaving, setIsLeaving] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [rightPanel, setRightPanel] = useState<'none' | 'info' | 'members'>('none');
    const [editingMessage, setEditingMessage] = useState<{ eventId: string; content: string } | null>(null);

    const room = rooms.find((r) => r.roomId === roomId);
    const membership = room?.getMyMembership();

    // Mark room as read when opened (only if joined)
    useEffect(() => {
        if (room && membership === 'join' && markRoomAsRead) {
            markRoomAsRead(roomId);
        }
    }, [roomId, room, membership, markRoomAsRead]);

    const handleSendMessage = async (message: string) => {
        await sendMessage(roomId, message);
    };

    const handleTyping = async (isTyping: boolean) => {
        await sendTyping(roomId, isTyping);
    };

    const handleReact = async (eventId: string, emoji: string) => {
        if (sendReaction) {
            await sendReaction(roomId, eventId, emoji);
        }
    };

    const handleRemoveReaction = async (roomId: string, reactionEventId: string) => {
        if (removeReaction) {
            await removeReaction(roomId, reactionEventId);
        }
    };

    const handleStartEdit = (eventId: string, content: string) => {
        setEditingMessage({ eventId, content });
    };

    const handleSaveEdit = async (eventId: string, newContent: string) => {
        if (editMessage) {
            await editMessage(roomId, eventId, newContent);
            setEditingMessage(null);
        }
    };

    const handleCancelEdit = () => {
        setEditingMessage(null);
    };

    const handleSendFile = async (file: File) => {
        if (!uploadFile || !sendImageMessage || !sendFileMessage) return;

        try {
            // Upload file to Matrix
            const uploadResult = await uploadFile(file);
            if (!uploadResult?.success || !uploadResult.mxcUrl) {
                console.error('File upload failed');
                return;
            }

            // Send appropriate message type
            if (file.type.startsWith('image/')) {
                await sendImageMessage(roomId, file, uploadResult.mxcUrl);
            } else {
                await sendFileMessage(roomId, file, uploadResult.mxcUrl);
            }
        } catch (error) {
            console.error('Error sending file:', error);
        }
    };

    const handleLeaveRoom = async () => {
        if (confirm('Are you sure you want to leave this room?')) {
            setIsLeaving(true);
            await leaveRoom(roomId);
            window.location.href = '/chat';
        }
    };

    const handleJoinRoom = async () => {
        if (!joinRoom) return;
        setIsJoining(true);
        const result = await joinRoom(roomId);
        setIsJoining(false);
        if (!result?.success) {
            alert('Failed to join room: ' + result?.error);
        }
    };

    if (!isReady) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-950">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                    <p className="text-slate-400">Loading room...</p>
                </div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-950">
                <div className="text-center max-w-md px-4">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Room not found</h3>
                    <p className="text-slate-400 mb-4">
                        We couldn't find the room <code className="bg-slate-800 px-1 py-0.5 rounded text-xs">{roomId}</code>.
                    </p>
                    <p className="text-slate-500 text-sm">
                        It might not exist, or you might not have permission to view it.
                        <br />
                        Debug: {rooms.length} rooms loaded.
                    </p>
                </div>
            </div>
        );
    }

    const getRoomName = () => {
        return room.name || room.getDefaultRoomName(session.userId) || 'Unnamed Room';
    };

    const getMemberCount = () => {
        return room.getJoinedMemberCount();
    };

    // Invite/Preview View
    if (membership === 'invite') {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-950">
                <div className="text-center max-w-md px-4">
                    <div className="w-20 h-20 bg-[#21262C] rounded-full flex items-center justify-center mx-auto mb-6 text-[#0DBD8B] text-3xl font-bold">
                        {getRoomName().charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{getRoomName()}</h2>
                    <p className="text-slate-400 mb-6">Do you want to join this room?</p>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={handleLeaveRoom}
                            disabled={isLeaving}
                            className="px-6 py-2 rounded-md bg-slate-800 text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
                        >
                            {isLeaving ? 'Rejecting...' : 'Reject'}
                        </button>
                        <button
                            onClick={handleJoinRoom}
                            disabled={isJoining}
                            className="px-6 py-2 rounded-md bg-[#0DBD8B] text-white hover:bg-[#0aa479] transition-colors disabled:opacity-50 font-medium"
                        >
                            {isJoining ? 'Joining...' : 'Join Room'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex bg-slate-950">
            <div className="flex-1 flex flex-col">
                {/* Room Header */}
                <div className="bg-[#15191E] border-b border-[#21262C] p-4">
                    <div className="flex items-center justify-between">
                        <div
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setRightPanel(rightPanel === 'info' ? 'none' : 'info')}
                        >
                            <h1 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#21262C] flex items-center justify-center text-xs text-slate-400">#</span>
                                {getRoomName()}
                            </h1>
                            <p className="text-xs text-slate-400 mt-0.5">{getMemberCount()} members</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Toggle Member List Button */}
                            <button
                                onClick={() => setRightPanel(rightPanel === 'members' ? 'none' : 'members')}
                                className={`p-2 rounded-md transition-colors ${rightPanel === 'members'
                                    ? 'text-[#0DBD8B] bg-[#21262C]'
                                    : 'text-slate-400 hover:text-white hover:bg-[#21262C]'
                                    }`}
                                title="Toggle member list"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </button>

                            {/* Leave Room Button */}
                            <button
                                onClick={handleLeaveRoom}
                                disabled={isLeaving}
                                className="text-slate-400 hover:text-red-400 transition-colors p-2 disabled:opacity-50 hover:bg-[#21262C] rounded-md"
                                title="Leave room"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <MessageList
                    room={room}
                    client={client!}
                    currentUserId={session.userId}
                    onReact={handleReact}
                    onRemoveReaction={handleRemoveReaction}
                    onEditMessage={handleStartEdit}
                />

                {/* Typing Indicator */}
                <TypingIndicator room={room} client={client!} currentUserId={session.userId} />

                {/* Message Input */}
                <MessageInput
                    onSendMessage={handleSendMessage}
                    onTyping={handleTyping}
                    onEditMessage={handleSaveEdit}
                    onSendFile={handleSendFile}
                    editingMessage={editingMessage}
                    onCancelEdit={handleCancelEdit}
                />
            </div>

            {/* Member List Sidebar */}
            {rightPanel === 'info' && (
                <RoomInfo
                    room={room}
                    currentUserId={session.userId}
                    onClose={() => setRightPanel('none')}
                    onViewMembers={() => setRightPanel('members')}
                    onLeaveRoom={handleLeaveRoom}
                />
            )}
            {rightPanel === 'members' && (
                <MemberList
                    room={room}
                    currentUserId={session.userId}
                    onClose={() => setRightPanel('none')}
                    onBack={() => setRightPanel('info')}
                />
            )}
        </div>
    );
}
