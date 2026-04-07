'use client';

import { useEffect, useRef, useState } from 'react';
import type { Room, MatrixEvent, MatrixClient } from '@/lib/matrix/client-only';
import ReactionPicker from './ReactionPicker';
import LinkPreview from './LinkPreview';
import MediaMessage from './MediaMessage';

interface MessageListProps {
    room: Room;
    client: MatrixClient;
    currentUserId: string;
    onReact?: (eventId: string, emoji: string) => void;
    onRemoveReaction?: (roomId: string, reactionEventId: string) => void;
    onEditMessage?: (eventId: string, content: string) => void;
}

interface Message {
    eventId: string;
    sender: string;
    senderName: string;
    content: string;
    timestamp: number;
    isOwn: boolean;
    isEdited?: boolean;
    reactions?: Record<string, { count: number; users: string[]; reactionEventIds: string[] }>;
    type?: string;
    url?: string;
    info?: any;
    replyToId?: string;
}

export default function MessageList({ room, client, currentUserId, onReact, onRemoveReaction, onEditMessage }: MessageListProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
    const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [canLoadMore, setCanLoadMore] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const previousScrollHeightRef = useRef<number>(0);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!room) return;

        // Load initial messages with reactions
        const loadMessages = () => {
            const timeline = room.getLiveTimeline();
            const events = timeline.getEvents();
            console.log('[MessageList] Loading messages, total events:', events.length);

            const messageEvents = events
                .filter((event) => event.getType() === 'm.room.message')
                .map((event) => {
                    const sender = event.getSender() || '';
                    const member = room.getMember(sender);
                    const eventId = event.getId() || '';

                    // Get reactions for this message
                    const reactions = getReactionsForEvent(eventId, events);

                    // Check if message was edited
                    const content = event.getContent();
                    const isEdited = !!(content['m.relates_to']?.rel_type === 'm.replace' || content['m.new_content']);
                    const replyToId = content['m.relates_to']?.['m.in_reply_to']?.event_id;

                    return {
                        eventId,
                        sender,
                        senderName: member?.name || sender,
                        content: content['m.new_content']?.body || content.body || '',
                        timestamp: event.getTs(),
                        isOwn: sender === currentUserId,
                        isEdited,
                        reactions,
                        type: content.msgtype || 'm.text',
                        url: content['m.new_content']?.url || content.url,
                        info: content['m.new_content']?.info || content.info,
                        replyToId,
                    };
                });

            console.log('[MessageList] Loaded message events:', messageEvents.length);
            setMessages(messageEvents);
            setTimeout(scrollToBottom, 100);
        };

        // Get reactions for a specific event
        const getReactionsForEvent = (eventId: string, events: MatrixEvent[]) => {
            const reactions: Record<string, { count: number; users: string[]; reactionEventIds: string[] }> = {};

            events
                .filter((e) => e.getType() === 'm.reaction')
                .forEach((reactionEvent) => {
                    const relation = reactionEvent.getContent()['m.relates_to'];
                    if (relation && relation.event_id === eventId) {
                        const emoji = relation.key;
                        if (!emoji) return; // Skip if no emoji key

                        const sender = reactionEvent.getSender() || '';
                        const reactionEventId = reactionEvent.getId() || '';

                        if (!reactions[emoji]) {
                            reactions[emoji] = { count: 0, users: [], reactionEventIds: [] };
                        }

                        reactions[emoji].count++;
                        reactions[emoji].users.push(sender);
                        reactions[emoji].reactionEventIds.push(reactionEventId);
                    }
                });

            return Object.keys(reactions).length > 0 ? reactions : undefined;
        };

        // Load full history automatically
        const loadFullHistory = async () => {
            console.log('🔄 Starting full history load...');
            const timeline = room.getLiveTimeline();

            // Keep paginating until we have all messages
            let hasMore = true;
            let iterations = 0;
            const maxIterations = 100; // Safety limit

            while (hasMore && iterations < maxIterations) {
                const token = timeline.getPaginationToken('b' as any);
                console.log(`📄 Iteration ${iterations + 1}: Token exists: ${!!token}`);

                if (!token) {
                    console.log('✅ No more pagination tokens - reached the beginning!');
                    hasMore = false;
                    break;
                }

                try {
                    await client.paginateEventTimeline(timeline, { backwards: true, limit: 100 });
                    const currentEvents = timeline.getEvents();
                    const messageCount = currentEvents.filter((e: MatrixEvent) => e.getType() === 'm.room.message').length;
                    console.log(`📊 After iteration ${iterations + 1}: ${messageCount} total messages loaded`);
                    iterations++;
                } catch (error) {
                    console.error('❌ Error loading history:', error);
                    hasMore = false;
                }
            }

            console.log(`🏁 Finished loading history after ${iterations} iterations`);
            setCanLoadMore(false);
            loadMessages();
        };

        loadFullHistory();

        // Listen for new messages and reactions
        const onTimelineEvent = (event: MatrixEvent) => {
            if (event.getRoomId() !== room.roomId) return;

            if (event.getType() === 'm.room.message') {
                const sender = event.getSender() || '';
                const member = room.getMember(sender);
                const eventId = event.getId() || '';
                const content = event.getContent();
                const replyToId = content['m.relates_to']?.['m.in_reply_to']?.event_id;

                const newMessage: Message = {
                    eventId,
                    sender,
                    senderName: member?.name || sender,
                    content: content.body || '',
                    timestamp: event.getTs(),
                    isOwn: sender === currentUserId,
                    type: content.msgtype || 'm.text',
                    url: content.url,
                    info: content.info,
                    replyToId,
                };

                setMessages((prev) => [...prev, newMessage]);
                setTimeout(scrollToBottom, 100);

                // Send read receipt
                if (!newMessage.isOwn) {
                    client.sendReadReceipt(event).catch(console.error);
                }
            } else if (event.getType() === 'm.reaction') {
                // Update reactions
                loadMessages();
            }
        };

        client.on('Room.timeline' as any, onTimelineEvent);
        client.on('Room.redaction' as any, loadMessages); // Reload when reactions are removed

        return () => {
            client.off('Room.timeline' as any, onTimelineEvent);
            client.off('Room.redaction' as any, loadMessages);
        };
    }, [room, client, currentUserId]);

    // Load more messages when scrolling to top
    const loadMoreMessages = async () => {
        console.log('[Pagination] loadMoreMessages called', { isLoadingMore, canLoadMore });
        if (!room || isLoadingMore || !canLoadMore) {
            console.log('[Pagination] Skipping - conditions not met');
            return;
        }

        setIsLoadingMore(true);
        const container = messagesContainerRef.current;
        if (container) {
            previousScrollHeightRef.current = container.scrollHeight;
        }

        try {
            const timeline = room.getLiveTimeline();
            const canPaginate = timeline.getPaginationToken('b' as any);
            console.log('[Pagination] Can paginate:', !!canPaginate);

            if (!canPaginate) {
                console.log('[Pagination] No more messages to load');
                setCanLoadMore(false);
                setIsLoadingMore(false);
                return;
            }

            console.log('[Pagination] Fetching older messages...');
            await client.paginateEventTimeline(timeline, { backwards: true, limit: 50 });

            // Reload messages after pagination
            const events = timeline.getEvents();
            console.log('[Pagination] Total events after pagination:', events.length);

            const messageEvents = events
                .filter((event) => event.getType() === 'm.room.message')
                .map((event) => {
                    const sender = event.getSender() || '';
                    const member = room.getMember(sender);
                    const eventId = event.getId() || '';
                    const content = event.getContent();
                    const isEdited = !!(content['m.relates_to']?.rel_type === 'm.replace' || content['m.new_content']);
                    const replyToId = content['m.relates_to']?.['m.in_reply_to']?.event_id;

                    return {
                        eventId,
                        sender,
                        senderName: member?.name || sender,
                        content: content['m.new_content']?.body || content.body || '',
                        timestamp: event.getTs(),
                        isOwn: sender === currentUserId,
                        isEdited,
                        type: content.msgtype || 'm.text',
                        url: content['m.new_content']?.url || content.url,
                        info: content['m.new_content']?.info || content.info,
                        replyToId,
                    };
                });

            console.log('[Pagination] Message events after pagination:', messageEvents.length);
            setMessages(messageEvents);

            // Restore scroll position
            setTimeout(() => {
                if (container && previousScrollHeightRef.current) {
                    const newScrollHeight = container.scrollHeight;
                    container.scrollTop = newScrollHeight - previousScrollHeightRef.current;
                    console.log('[Pagination] Scroll restored');
                }
            }, 0);
        } catch (error) {
            console.error('[Pagination] Failed to load more messages:', error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    // Handle scroll event
    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (!container) return;

        // Load more when scrolled near the top (within 100px)
        if (container.scrollTop < 100 && !isLoadingMore && canLoadMore) {
            console.log('[Scroll] Triggering loadMoreMessages, scrollTop:', container.scrollTop);
            loadMoreMessages();
        }
    };

    const handleReact = (eventId: string, emoji: string) => {
        if (onReact) {
            onReact(eventId, emoji);
        }
    };

    const handleReactionClick = (eventId: string, emoji: string, reactionEventIds: string[], users: string[]) => {
        // Check if current user already reacted
        const userIndex = users.indexOf(currentUserId);

        if (userIndex !== -1 && onRemoveReaction) {
            // Remove reaction
            const reactionEventId = reactionEventIds[userIndex];
            onRemoveReaction(room.roomId, reactionEventId);
        } else if (onReact) {
            // Add reaction
            onReact(eventId, emoji);
        }
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };



    const linkifyText = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);

        return parts.map((part, i) => {
            if (part.match(urlRegex)) {
                return (
                    <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-[#0DBD8B] hover:underline break-all">
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    const getReplyContent = (replyToId: string) => {
        const replyMessage = messages.find(m => m.eventId === replyToId);
        if (replyMessage) {
            return {
                sender: replyMessage.senderName,
                content: replyMessage.content
            };
        }
        return null;
    };

    const getEffectiveType = (message: Message) => {
        if (message.type !== 'm.file') return message.type;

        const mimetype = message.info?.mimetype;
        const filename = message.content.toLowerCase();

        if (mimetype) {
            if (mimetype.startsWith('image/')) return 'm.image';
            if (mimetype.startsWith('video/')) return 'm.video';
            if (mimetype.startsWith('audio/')) return 'm.audio';
        }

        // Fallback to extension
        if (/\.(jpg|jpeg|png|gif|webp|svg)$/.test(filename)) return 'm.image';
        if (/\.(mp4|webm|ogg|mov)$/.test(filename)) return 'm.video';
        if (/\.(mp3|wav|m4a)$/.test(filename)) return 'm.audio';

        return 'm.file';
    };

    const renderMessageContent = (message: Message) => {
        const effectiveType = getEffectiveType(message);

        switch (effectiveType) {
            case 'm.image':
            case 'm.video':
            case 'm.audio':
                return (
                    <MediaMessage
                        type={effectiveType}
                        content={message.content}
                        mxcUrl={message.url}
                        client={client}
                    />
                );
            case 'm.file':
                const httpUrl = message.url ? client.mxcUrlToHttp(message.url, 800, 600, 'scale') : null;
                return (
                    <div className="flex items-center gap-3 bg-[#2c333a] p-3 rounded-lg max-w-md group/file hover:bg-[#363d45] transition-colors">
                        <div className="w-10 h-10 bg-[#0DBD8B]/20 rounded-full flex items-center justify-center text-[#0DBD8B]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">{message.content}</div>
                            {message.info?.size && (
                                <div className="text-xs text-slate-400">{(message.info.size / 1024).toFixed(1)} KB</div>
                            )}
                        </div>
                        {httpUrl && (
                            <a
                                href={httpUrl}
                                download={message.content}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-full transition-colors"
                                title="Download"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </a>
                        )}
                    </div>
                );
            default:
                // Extract URLs for preview
                const urlRegex = /(https?:\/\/[^\s]+)/g;
                const urls = message.content.match(urlRegex) || [];
                const uniqueUrls = [...new Set(urls)].slice(0, 3); // Limit to 3 previews

                return (
                    <div className="text-[#e2e8f0] text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                        {linkifyText(message.content)}
                        {message.isEdited && (
                            <span className="ml-1 text-[10px] text-slate-500">(edited)</span>
                        )}

                        {/* Link Previews */}
                        {uniqueUrls.length > 0 && (
                            <div className="mt-2 space-y-2">
                                {uniqueUrls.map((url, i) => (
                                    <LinkPreview key={i} url={url} />
                                ))}
                            </div>
                        )}
                    </div>
                );
        }
    };

    let lastDate = '';

    return (
        <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar"
        >
            {/* Loading indicator at top */}
            {isLoadingMore && (
                <div className="flex justify-center py-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0DBD8B]"></div>
                </div>
            )}
            {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-[#21262C] rounded-full flex items-center justify-center mx-auto mb-4 text-[#0DBD8B]">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className="text-slate-400 text-sm">
                            No messages here yet.<br />
                            Send a message to start the conversation!
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {messages.map((message, index) => {
                        const messageDate = formatDate(message.timestamp);
                        const showDateDivider = messageDate !== lastDate;
                        lastDate = messageDate;

                        // Check if previous message was from same sender (for grouping)
                        const isSequence = index > 0 && messages[index - 1].sender === message.sender && !showDateDivider;

                        // Get reply content if exists
                        const replyContent = message.replyToId ? getReplyContent(message.replyToId) : null;

                        return (
                            <div key={message.eventId} className={`group ${isSequence ? 'mt-0.5' : 'mt-4'}`}>
                                {/* Date Divider */}
                                {showDateDivider && (
                                    <div className="flex items-center justify-center my-6">
                                        <div className="text-slate-500 text-xs font-medium px-2">{messageDate}</div>
                                    </div>
                                )}

                                {/* Message Row */}
                                <div
                                    className={`flex gap-3 hover:bg-[#21262C]/30 -mx-4 px-4 py-1 transition-colors relative ${message.isOwn ? '' : ''}`}
                                    onMouseEnter={() => setHoveredMessage(message.eventId)}
                                    onMouseLeave={() => setHoveredMessage(null)}
                                >
                                    {/* Avatar (only show for first in sequence) */}
                                    {!isSequence ? (
                                        <div className="w-8 h-8 flex-shrink-0 mt-0.5">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${message.isOwn ? 'bg-[#0DBD8B]' : 'bg-slate-600'}`}>{message.senderName.charAt(0).toUpperCase()}</div>
                                        </div>
                                    ) : (
                                        <div className="w-8 flex-shrink-0">
                                            <span className="text-[10px] text-slate-600 hidden group-hover:block text-right pr-1 pt-1">{formatTime(message.timestamp)}</span>
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        {/* Header (Sender Name & Time) - only for first in sequence */}
                                        {!isSequence && (
                                            <div className="flex items-baseline gap-2 mb-0.5">
                                                <span className={`text-sm font-semibold ${message.isOwn ? 'text-[#0DBD8B]' : 'text-[#e2e8f0]'}`}>{message.senderName}</span>
                                                <span className="text-[10px] text-slate-500">{formatTime(message.timestamp)}</span>
                                            </div>
                                        )}

                                        {/* Reply Preview */}
                                        {replyContent && (
                                            <div className="mb-1 flex items-center gap-2">
                                                <div className="w-0.5 h-8 bg-slate-600 rounded-full"></div>
                                                <div className="text-xs text-slate-400">
                                                    <span className="font-medium text-slate-300">{replyContent.sender}</span>
                                                    <span className="mx-1"> </span>
                                                    <span className="truncate max-w-xs inline-block align-bottom">{replyContent.content}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Message Content */}
                                        {renderMessageContent(message)}

                                        {/* Reactions */}
                                        {message.reactions && Object.keys(message.reactions).length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                {Object.entries(message.reactions).map(([emoji, data]) => {
                                                    const userReacted = data.users.includes(currentUserId);
                                                    return (
                                                        <button
                                                            key={emoji}
                                                            onClick={() => handleReactionClick(message.eventId, emoji, data.reactionEventIds, data.users)}
                                                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${userReacted
                                                                ? 'bg-[#0DBD8B]/20 border-[#0DBD8B] text-[#0DBD8B]'
                                                                : 'bg-[#21262C] border-slate-700 text-slate-400 hover:border-slate-500'
                                                                }`}
                                                            title={data.users.join(', ')}
                                                        >
                                                            <span>{emoji}</span>
                                                            <span className="font-medium">{data.count}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons (Floating on right) */}
                                    <div className={`absolute right-4 top-0 -translate-y-1/2 flex items-center gap-1 bg-[#15191E] border border-[#21262C] rounded-md shadow-sm p-0.5 ${hoveredMessage === message.eventId ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-200`}>
                                        {/* Edit Button (own messages only) */}
                                        {message.isOwn && message.type === 'm.text' && onEditMessage && (
                                            <button
                                                onClick={() => onEditMessage(message.eventId, message.content)}
                                                className="text-slate-400 hover:text-white hover:bg-[#21262C] p-1.5 rounded transition-colors"
                                                title="Edit"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                        )}

                                        {/* Reaction Button */}
                                        <button
                                            onClick={() => setShowReactionPicker(message.eventId)}
                                            className="text-slate-400 hover:text-white hover:bg-[#21262C] p-1.5 rounded transition-colors"
                                            title="React"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>

                                        {/* Reaction Picker */}
                                        {showReactionPicker === message.eventId && (
                                            <div className="absolute right-0 top-full mt-1 z-50">
                                                <ReactionPicker
                                                    onReact={(emoji) => handleReact(message.eventId, emoji)}
                                                    onClose={() => setShowReactionPicker(null)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </>
            )}
        </div>
    );
}
