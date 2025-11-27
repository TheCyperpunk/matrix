/**
 * Chat Layout
 * Main layout for chat pages with sidebar
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMatrixClient } from '@/hooks/useMatrixClient';
import RoomList from '@/components/chat/RoomList';
import { CreateRoomModal, JoinRoomModal } from '@/components/chat/Modals';
import { logoutAction } from '@/lib/matrix/actions';

interface ChatLayoutProps {
    children: React.ReactNode;
    session: {
        accessToken: string;
        userId: string;
    };
}

export default function ChatLayout({ children, session }: ChatLayoutProps) {
    const router = useRouter();
    const {
        rooms,
        isReady,
        isSyncing,
        error,
        unreadCounts,
        createRoom,
        joinRoom,
    } = useMatrixClient({
        accessToken: session.accessToken,
        userId: session.userId,
    });

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

    const handleCreateRoom = async (name: string, topic: string) => {
        const result = await createRoom(name, topic);
        if (result?.success && result.roomId) {
            router.push(`/chat/${result.roomId}`);
        }
    };

    const handleJoinRoom = async (roomIdOrAlias: string) => {
        const result = await joinRoom(roomIdOrAlias);
        if (result?.success && result.roomId) {
            router.push(`/chat/${result.roomId}`);
        }
    };

    const handleLogout = async () => {
        await logoutAction();
    };

    return (
        <div className="flex h-screen bg-slate-950">
            {/* Sidebar */}
            <div className="flex flex-col">
                {/* User Info Header */}
                <div className="w-80 bg-[#21262C] p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#0DBD8B] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {session.userId.charAt(1).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold truncate text-sm">
                                    {session.userId.split(':')[0].substring(1)}
                                </p>
                                <div className="flex items-center gap-1">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-[#0DBD8B]' : 'bg-yellow-500'}`}></div>
                                    <p className="text-xs text-slate-400">
                                        {isSyncing ? 'Online' : 'Connecting...'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-slate-400 hover:text-white transition-colors p-2"
                            title="Logout"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Room List */}
                <RoomList
                    rooms={rooms}
                    unreadCounts={unreadCounts}
                    onCreateRoom={() => setIsCreateModalOpen(true)}
                    onJoinRoom={() => setIsJoinModalOpen(true)}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {error ? (
                    <div className="flex-1 flex items-center justify-center bg-slate-950">
                        <div className="text-center max-w-md">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
                                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Connection Error</h3>
                            <p className="text-slate-400 mb-4">{error}</p>
                            <p className="text-sm text-slate-500">The Matrix client will automatically retry connecting.</p>
                        </div>
                    </div>
                ) : !isReady ? (
                    <div className="flex-1 flex items-center justify-center bg-slate-950">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                            <p className="text-slate-400">Loading Matrix client...</p>
                        </div>
                    </div>
                ) : (
                    children
                )}
            </div>

            {/* Modals */}
            <CreateRoomModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateRoom}
            />
            <JoinRoomModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
                onJoin={handleJoinRoom}
            />
        </div>
    );
}
