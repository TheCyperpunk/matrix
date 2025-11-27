/**
 * Typing Indicator Component
 * Shows when other users are typing
 */

'use client';

import { useEffect, useState } from 'react';
import type { Room, MatrixClient } from '@/lib/matrix/client-only';

interface TypingIndicatorProps {
    room: Room;
    client: MatrixClient;
    currentUserId: string;
}

export default function TypingIndicator({ room, client, currentUserId }: TypingIndicatorProps) {
    const [typingUsers, setTypingUsers] = useState<string[]>([]);

    useEffect(() => {
        if (!room || !client) return;

        const updateTypingUsers = () => {
            const typingMembers = room.currentState.getStateEvents('m.typing');
            if (typingMembers && typingMembers.length > 0) {
                const content = typingMembers[0].getContent();
                const userIds = content.user_ids || [];
                const otherUsers = userIds.filter((id: string) => id !== currentUserId);
                setTypingUsers(otherUsers);
            } else {
                setTypingUsers([]);
            }
        };

        const onTyping = (event: any) => {
            if (event.getRoomId() === room.roomId) {
                updateTypingUsers();
            }
        };

        client.on('RoomMember.typing' as any, onTyping);
        updateTypingUsers();

        return () => {
            client.off('RoomMember.typing' as any, onTyping);
        };
    }, [room, client, currentUserId]);

    if (typingUsers.length === 0) {
        return null;
    }

    const getUserName = (userId: string) => {
        const member = room.getMember(userId);
        return member?.name || userId;
    };

    const typingText = () => {
        if (typingUsers.length === 1) {
            return `${getUserName(typingUsers[0])} is typing...`;
        } else if (typingUsers.length === 2) {
            return `${getUserName(typingUsers[0])} and ${getUserName(typingUsers[1])} are typing...`;
        } else {
            return `${typingUsers.length} people are typing...`;
        }
    };

    return (
        <div className="px-4 py-2 text-sm text-slate-400 italic">
            <div className="flex items-center gap-2">
                <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#0DBD8B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-[#0DBD8B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-[#0DBD8B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-xs">{typingText()}</span>
            </div>
        </div>
    );
}
