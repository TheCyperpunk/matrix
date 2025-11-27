/**
 * Reaction Picker Component
 * Emoji picker for reacting to messages
 */

'use client';

interface ReactionPickerProps {
    onReact: (emoji: string) => void;
    onClose: () => void;
}

const COMMON_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏'];

export default function ReactionPicker({ onReact, onClose }: ReactionPickerProps) {
    const handleReact = (emoji: string) => {
        onReact(emoji);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Picker */}
            <div className="absolute bottom-full mb-2 left-0 z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl p-2 flex gap-1 animate-fade-in">
                {COMMON_REACTIONS.map((emoji) => (
                    <button
                        key={emoji}
                        onClick={() => handleReact(emoji)}
                        className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-slate-700 rounded-lg transition-colors"
                        title={`React with ${emoji}`}
                    >
                        {emoji}
                    </button>
                ))}
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(5px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.15s ease-out;
                }
            `}</style>
        </>
    );
}
