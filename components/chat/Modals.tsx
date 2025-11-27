/**
 * Create Room Modal Component
 */

'use client';

import { useState } from 'react';

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, topic: string) => void;
}

export function CreateRoomModal({ isOpen, onClose, onCreate }: CreateRoomModalProps) {
    const [name, setName] = useState('');
    const [topic, setTopic] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onCreate(name.trim(), topic.trim());
            setName('');
            setTopic('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Create Room</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="roomName" className="block text-sm font-medium text-slate-300 mb-2">
                                Room Name
                            </label>
                            <input
                                type="text"
                                id="roomName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter room name"
                                required
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label htmlFor="roomTopic" className="block text-sm font-medium text-slate-300 mb-2">
                                Topic (Optional)
                            </label>
                            <input
                                type="text"
                                id="roomTopic"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Enter room topic"
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

/**
 * Join Room Modal Component
 */

interface JoinRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onJoin: (roomIdOrAlias: string) => void;
}

export function JoinRoomModal({ isOpen, onClose, onJoin }: JoinRoomModalProps) {
    const [roomId, setRoomId] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (roomId.trim()) {
            onJoin(roomId.trim());
            setRoomId('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Join Room</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="roomId" className="block text-sm font-medium text-slate-300 mb-2">
                                Room ID or Alias
                            </label>
                            <input
                                type="text"
                                id="roomId"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                placeholder="!roomid:matrix.org or #alias:matrix.org"
                                required
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <p className="text-xs text-slate-400 mt-2">
                                Enter a room ID (starting with !) or room alias (starting with #)
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Join
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
