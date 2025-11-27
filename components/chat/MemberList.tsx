/**
 * Member List Component
 * Displays members of a Matrix room
 */

'use client';

import type { Room, RoomMember } from '@/lib/matrix/client-only';
import { useState, useEffect } from 'react';

interface MemberListProps {
    room: Room;
    currentUserId: string;
    onClose?: () => void;
    onBack?: () => void;
}

export default function MemberList({ room, currentUserId, onClose, onBack }: MemberListProps) {
    const [members, setMembers] = useState<RoomMember[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!room) return;

        const updateMembers = () => {
            const roomMembers = room.getJoinedMembers();
            // Sort: High power levels first, then alphabetical
            roomMembers.sort((a, b) => {
                if (a.powerLevel !== b.powerLevel) {
                    return b.powerLevel - a.powerLevel;
                }
                return a.name.localeCompare(b.name);
            });
            setMembers(roomMembers);
        };

        updateMembers();

        // Listen for membership changes
        room.on('RoomMember.membership' as any, updateMembers);
        room.on('RoomMember.powerLevel' as any, updateMembers);

        return () => {
            room.off('RoomMember.membership' as any, updateMembers);
            room.off('RoomMember.powerLevel' as any, updateMembers);
        };
    }, [room]);

    const filteredMembers = members.filter((member) => {
        const displayName = member.name.toLowerCase();
        const userId = member.userId.toLowerCase();
        const query = searchQuery.toLowerCase();
        return displayName.includes(query) || userId.includes(query);
    });

    const getMemberAvatar = (member: RoomMember) => {
        const avatarMxc = member.getMxcAvatarUrl();
        if (avatarMxc && room.client.baseUrl) {
            return room.client.mxcUrlToHttp(avatarMxc, 40, 40, 'crop') || null;
        }
        return null;
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleLabel = (powerLevel: number) => {
        if (powerLevel >= 100) return 'Admin';
        if (powerLevel >= 50) return 'Moderator';
        return null;
    };

    return (
        <div className="w-80 bg-[#111316] flex flex-col h-full border-l border-[#1a1d21]">
            {/* Header */}
            <div className="p-4 border-b border-[#1a1d21]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-[#21262C] transition-colors -ml-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                        <h3 className="text-[17px] font-bold text-white">
                            People
                        </h3>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-[#21262C] transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="relative group mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-500 group-focus-within:text-[#0DBD8B] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search room members"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1a1d21] border border-transparent focus:border-[#0DBD8B] rounded-full pl-10 pr-4 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none transition-all"
                    />
                </div>

                {/* Member Count */}
                <div className="text-[13px] font-semibold text-[#0DBD8B]">
                    {members.length} Members
                </div>
            </div>

            {/* Member List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredMembers.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-500 text-sm">No members found</p>
                    </div>
                ) : (
                    <div className="py-1">
                        {filteredMembers.map((member) => {
                            const isCurrentUser = member.userId === currentUserId;
                            const avatarUrl = getMemberAvatar(member);
                            const role = getRoleLabel(member.powerLevel);

                            return (
                                <div
                                    key={member.userId}
                                    className="px-4 py-3 hover:bg-[#1a1d21] transition-colors cursor-pointer group flex items-center gap-3"
                                >
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        {avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                alt={member.name}
                                                className="w-9 h-9 rounded-full object-cover bg-[#21262C]"
                                            />
                                        ) : (
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                                                // Generate a consistent color based on user ID
                                                ['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-yellow-600', 'bg-pink-600', 'bg-indigo-600'][
                                                member.userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6
                                                ]
                                                }`}>
                                                {getInitials(member.name)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                                        <div className="flex items-center justify-between gap-2 w-full">
                                            <div
                                                className={`text-[15px] font-bold truncate ${isCurrentUser ? 'text-[#0DBD8B]' : 'text-white'} leading-tight flex-1 min-w-0`}
                                                title={member.name}
                                            >
                                                {member.name}
                                            </div>
                                            {role && (
                                                <span className="text-[11px] text-gray-500 font-medium flex-shrink-0">
                                                    {role}
                                                </span>
                                            )}
                                        </div>
                                        <div
                                            className="text-[13px] text-gray-500 truncate font-normal leading-tight"
                                            title={member.userId}
                                        >
                                            {member.userId}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
