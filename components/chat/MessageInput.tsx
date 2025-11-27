/**
 * Message Input Component
 * Input field for sending messages with typing indicators, edit mode, and file uploads
 */

'use client';

import { useState, useRef, useEffect } from 'react';

interface MessageInputProps {
    onSendMessage: (message: string) => void;
    onTyping: (isTyping: boolean) => void;
    onEditMessage?: (eventId: string, newContent: string) => void;
    onSendFile?: (file: File) => void;
    editingMessage?: { eventId: string; content: string } | null;
    onCancelEdit?: () => void;
    disabled?: boolean;
}

export default function MessageInput({
    onSendMessage,
    onTyping,
    onEditMessage,
    onSendFile,
    editingMessage,
    onCancelEdit,
    disabled
}: MessageInputProps) {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [uploading, setUploading] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Pre-fill input when editing
    useEffect(() => {
        if (editingMessage) {
            setMessage(editingMessage.content);
            inputRef.current?.focus();
        }
    }, [editingMessage]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (message.trim() && !disabled) {
            if (editingMessage && onEditMessage) {
                // Edit mode
                onEditMessage(editingMessage.eventId, message.trim());
            } else {
                // Send new message
                onSendMessage(message.trim());
            }

            setMessage('');
            setIsTyping(false);
            onTyping(false);

            // Clear typing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }
    };

    const handleCancel = () => {
        setMessage('');
        if (onCancelEdit) {
            onCancelEdit();
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onSendFile) {
            setUploading(true);
            try {
                await onSendFile(file);
            } finally {
                setUploading(false);
                // Reset file input
                if (e.target) {
                    e.target.value = '';
                }
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setMessage(value);

        // Don't send typing indicator in edit mode
        if (editingMessage) return;

        // Handle typing indicator
        if (value.trim() && !isTyping) {
            setIsTyping(true);
            onTyping(true);
        }

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing indicator
        if (value.trim()) {
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                onTyping(false);
            }, 3000);
        } else {
            setIsTyping(false);
            onTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        } else if (e.key === 'Escape' && editingMessage) {
            handleCancel();
        }
    };

    useEffect(() => {
        // Auto-resize textarea
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
        }
    }, [message]);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="border-t border-[#21262C] bg-[#15191E] p-4">
            {/* Edit Mode Indicator */}
            {editingMessage && (
                <div className="mb-2 flex items-center justify-between bg-[#21262C] border border-[#0DBD8B]/30 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 text-sm text-[#0DBD8B]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Editing message</span>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="Cancel editing (Esc)"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Upload Progress */}
            {uploading && (
                <div className="mb-2 flex items-center gap-2 bg-[#21262C] border border-[#0DBD8B]/30 rounded-lg px-3 py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0DBD8B]"></div>
                    <span className="text-sm text-[#0DBD8B]">Uploading file...</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-end gap-2">
                {/* File Upload Buttons */}
                {!editingMessage && onSendFile && (
                    <>
                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            disabled={disabled || uploading}
                            className="text-slate-400 hover:text-[#0DBD8B] transition-colors p-3 disabled:opacity-50 hover:bg-[#21262C] rounded-full"
                            title="Upload image"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled || uploading}
                            className="text-slate-400 hover:text-[#0DBD8B] transition-colors p-3 disabled:opacity-50 hover:bg-[#21262C] rounded-full"
                            title="Upload file"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                        </button>
                    </>
                )}

                <div className="flex-1 relative">
                    <textarea
                        ref={inputRef}
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder={editingMessage ? "Edit your message..." : "Send a message..."}
                        disabled={disabled || uploading}
                        rows={1}
                        className="w-full px-4 py-3 bg-[#21262C] border-none rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0DBD8B] resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>
                <button
                    type="submit"
                    disabled={!message.trim() || disabled || uploading}
                    className="bg-[#21262C] hover:bg-[#0DBD8B] text-slate-400 hover:text-white p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#21262C] disabled:hover:text-slate-400"
                    title={editingMessage ? "Save changes" : "Send message"}
                >
                    {editingMessage ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                        </svg>
                    )}
                </button>
            </form>
        </div>
    );
}
