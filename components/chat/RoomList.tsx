/**
 * Room List Component
 * Displays all joined Matrix rooms
 */

'use client';

import type { Room } from '@/lib/matrix/client-only';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface RoomListProps {
    rooms: Room[];
    unreadCounts: Record<string, number>;
    onCreateRoom: () => void;
    onJoinRoom: () => void;
}

export default function RoomList({ rooms, unreadCounts, onCreateRoom, onJoinRoom }: RoomListProps) {
    const pathname = usePathname();

    const getRoomName = (room: Room) => {
        return room.name || room.getDefaultRoomName(room.myUserId) || 'Unnamed Room';
    };

    const getLastMessage = (room: Room) => {
        const timeline = room.getLiveTimeline();
        const events = timeline.getEvents();
        const lastEvent = events[events.length - 1];

        if (lastEvent && lastEvent.getType() === 'm.room.message') {
            const content = lastEvent.getContent();
            return content.body || '';
        }

        return 'No messages yet';
    };

    return (
        <div className="w-80 bg-[#21262C] flex flex-col h-screen">
            {/* Header */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Rooms</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={onCreateRoom}
                            className="text-slate-400 hover:text-white transition-colors"
                            title="Create Room"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                        <button
                            onClick={onJoinRoom}
                            className="text-slate-400 hover:text-white transition-colors"
                            title="Join Room"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Room List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {rooms.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">
                        <p className="text-sm">No rooms yet</p>
                    </div>
                ) : (
                    <div className="px-2 space-y-0.5">
                        {rooms.map((room) => {
                            const roomId = room.roomId;
                            const isActive = pathname === `/chat/${roomId}`;
                            const unreadCount = unreadCounts[roomId] || 0;

                            return (
                                <Link
                                    key={roomId}
                                    href={`/chat/${roomId}`}
                                    className={`block px-3 py-2 rounded-md transition-colors ${isActive
                                        ? 'bg-[#15191E] text-white'
                                        : 'text-slate-300 hover:bg-[#2c333a]'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Avatar Placeholder */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isActive ? 'bg-[#0DBD8B] text-white' : 'bg-slate-700 text-slate-300'}`}>
                                            {getRoomName(room).charAt(0).toUpperCase()}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className={`font-medium truncate text-sm ${isActive ? 'text-white' : 'text-slate-300'}`}>
                                                    {getRoomName(room)}
                                                </h3>
                                                {unreadCount > 0 && (
                                                    <span className="bg-[#0DBD8B] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-xs truncate ${isActive ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {getLastMessage(room)}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
