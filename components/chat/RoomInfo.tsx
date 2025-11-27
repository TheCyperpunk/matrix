/**
 * Room Info Component
 * Displays room details and actions (sidebar)
 */

'use client';

import { Room } from '@/lib/matrix/client-only';
import { useState } from 'react';

interface RoomInfoProps {
    room: Room;
    currentUserId: string;
    onClose: () => void;
    onViewMembers: () => void;
    onLeaveRoom: () => void;
}

export default function RoomInfo({ room, currentUserId, onClose, onViewMembers, onLeaveRoom }: RoomInfoProps) {
    const [isFavourite, setIsFavourite] = useState(false); // Placeholder state

    const getRoomName = () => {
        return room.name || room.getDefaultRoomName(currentUserId) || 'Unnamed Room';
    };

    const getRoomTopic = () => {
        // This is a placeholder. Matrix SDK room state handling for topic would go here.
        // For now, we'll return a static string or try to get it if available on the room object
        // but standard matrix-js-sdk room object might need specific state event lookup.
        const topicEvent = room.currentState.getStateEvents('m.room.topic', '');
        return topicEvent ? topicEvent.getContent().topic : '';
    };

    const memberCount = room.getJoinedMemberCount();

    return (
        <div className="w-80 bg-[#111316] flex flex-col h-full border-l border-[#1a1d21]">
            {/* Header / Search */}
            <div className="p-4 border-b border-[#1a1d21] flex items-center gap-2">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search messages..."
                        className="w-full bg-[#1a1d21] border border-transparent focus:border-[#0DBD8B] rounded-full pl-10 pr-4 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none transition-all"
                    />
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-[#21262C] rounded-full transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Room Profile (if needed, screenshot 2 shows it) */}
                <div className="p-6 flex flex-col items-center text-center border-b border-[#1a1d21]">
                    <div className="w-20 h-20 bg-[#21262C] rounded-full flex items-center justify-center mb-4 text-[#0DBD8B] text-3xl font-bold">
                        {getRoomName().charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-lg font-bold text-white mb-1">{getRoomName()}</h2>
                    <p className="text-sm text-gray-500 mb-4">#{room.roomId.split(':')[0].substring(1)}:matrix.org</p>

                    <div className="flex gap-2 mb-4">
                        <span className="px-3 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-full font-medium flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Public room
                        </span>
                        <span className="px-3 py-1 bg-slate-800 text-slate-400 text-xs rounded-full font-medium flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Not encrypted
                        </span>
                    </div>

                    <p className="text-sm text-gray-400 leading-relaxed text-left w-full">
                        {getRoomTopic() || "No topic set for this room."}
                    </p>
                </div>

                {/* Menu Items */}
                <div className="py-2 border-b border-[#1a1d21]">
                    <div className="px-4 py-3 flex items-center justify-between hover:bg-[#1a1d21] cursor-pointer transition-colors">
                        <div className="flex items-center gap-3 text-gray-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            <span className="text-[15px] font-medium">Favourite</span>
                        </div>
                        <div
                            className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${isFavourite ? 'bg-[#0DBD8B]' : 'bg-slate-700'}`}
                            onClick={() => setIsFavourite(!isFavourite)}
                        >
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isFavourite ? 'left-6' : 'left-1'}`}></div>
                        </div>
                    </div>

                    <div className="px-4 py-3 flex items-center gap-3 text-gray-300 hover:bg-[#1a1d21] cursor-pointer transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span className="text-[15px] font-medium">Invite</span>
                    </div>
                </div>

                <div className="py-2 border-b border-[#1a1d21]">
                    <div
                        className="px-4 py-3 flex items-center justify-between hover:bg-[#1a1d21] cursor-pointer transition-colors group"
                        onClick={onViewMembers}
                    >
                        <div className="flex items-center gap-3 text-gray-300 group-hover:text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span className="text-[15px] font-medium">People</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{memberCount}</span>
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>

                    <div className="px-4 py-3 flex items-center justify-between hover:bg-[#1a1d21] cursor-pointer transition-colors group">
                        <div className="flex items-center gap-3 text-gray-300 group-hover:text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <span className="text-[15px] font-medium">Threads</span>
                        </div>
                    </div>

                    <div className="px-4 py-3 flex items-center justify-between hover:bg-[#1a1d21] cursor-pointer transition-colors group">
                        <div className="flex items-center gap-3 text-gray-300 group-hover:text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <span className="text-[15px] font-medium">Pinned messages</span>
                        </div>
                        <span className="text-sm text-gray-500">8</span>
                    </div>

                    <div className="px-4 py-3 flex items-center justify-between hover:bg-[#1a1d21] cursor-pointer transition-colors group">
                        <div className="flex items-center gap-3 text-gray-300 group-hover:text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-[15px] font-medium">Files</span>
                        </div>
                    </div>

                    <div className="px-4 py-3 flex items-center justify-between hover:bg-[#1a1d21] cursor-pointer transition-colors group">
                        <div className="flex items-center gap-3 text-gray-300 group-hover:text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            <span className="text-[15px] font-medium">Extensions</span>
                        </div>
                    </div>
                </div>

                <div className="py-2 border-b border-[#1a1d21]">
                    <div className="px-4 py-3 flex items-center gap-3 text-gray-300 hover:bg-[#1a1d21] cursor-pointer transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="text-[15px] font-medium">Copy link</span>
                    </div>
                    <div className="px-4 py-3 flex items-center gap-3 text-gray-300 hover:bg-[#1a1d21] cursor-pointer transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span className="text-[15px] font-medium">Polls</span>
                    </div>
                    <div className="px-4 py-3 flex items-center gap-3 text-gray-300 hover:bg-[#1a1d21] cursor-pointer transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span className="text-[15px] font-medium">Export Chat</span>
                    </div>
                    <div className="px-4 py-3 flex items-center gap-3 text-gray-300 hover:bg-[#1a1d21] cursor-pointer transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-[15px] font-medium">Settings</span>
                    </div>
                </div>

                <div className="py-2">
                    <div className="px-4 py-3 flex items-center gap-3 text-red-500 hover:bg-[#1a1d21] cursor-pointer transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-[15px] font-medium">Report room</span>
                    </div>
                    <div
                        className="px-4 py-3 flex items-center gap-3 text-red-500 hover:bg-[#1a1d21] cursor-pointer transition-colors"
                        onClick={onLeaveRoom}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-[15px] font-medium">Leave room</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
