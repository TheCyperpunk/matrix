import { useState, useEffect } from 'react';
import type { MatrixClient } from '@/lib/matrix/client-only';

interface MediaMessageProps {
    type: 'm.image' | 'm.video' | 'm.audio';
    content: string; // filename or alt text
    mxcUrl?: string;
    client: MatrixClient;
}

export default function MediaMessage({ type, content, mxcUrl, client }: MediaMessageProps) {
    const [error, setError] = useState(false);
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let objectUrl: string | null = null;
        let mounted = true;

        const fetchMedia = async () => {
            if (!mxcUrl) {
                setLoading(false);
                return;
            }

            try {
                // Get the HTTP URL first
                const httpUrl = client.mxcUrlToHttp(mxcUrl, 800, 600, 'scale');
                if (!httpUrl) throw new Error('Failed to generate HTTP URL');

                // Fetch with authentication headers
                const response = await fetch(httpUrl, {
                    headers: {
                        'Authorization': `Bearer ${client.getAccessToken()}`
                    }
                });

                if (!response.ok) throw new Error(`Failed to fetch media: ${response.statusText}`);

                const blob = await response.blob();
                if (mounted) {
                    objectUrl = URL.createObjectURL(blob);
                    setMediaUrl(objectUrl);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error loading media:', err);
                if (mounted) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        fetchMedia();

        return () => {
            mounted = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [mxcUrl, client]);

    if (loading) {
        return (
            <div className="bg-slate-800/50 p-4 rounded-lg flex items-center justify-center w-64 h-48 animate-pulse">
                <div className="w-8 h-8 border-2 border-slate-600 border-t-[#0DBD8B] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!mediaUrl || error) {
        return (
            <div className="bg-slate-800 p-4 rounded-lg flex items-center gap-2 text-slate-400 max-w-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {type === 'm.image' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    )}
                    {type === 'm.video' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    )}
                    {type === 'm.audio' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    )}
                </svg>
                <span>{type === 'm.image' ? 'Image' : type === 'm.video' ? 'Video' : 'Audio'} failed to load</span>
            </div>
        );
    }

    switch (type) {
        case 'm.image':
            return (
                <div className="max-w-lg">
                    <a href={mediaUrl} target="_blank" rel="noopener noreferrer">
                        <img
                            src={mediaUrl}
                            alt="Image"
                            className="rounded-lg max-h-80 object-contain bg-black/20"
                            loading="lazy"
                        />
                    </a>
                </div>
            );
        case 'm.video':
            return (
                <div className="max-w-lg">
                    <video
                        controls
                        className="rounded-lg max-h-80 w-full bg-black/20"
                    >
                        <source src={mediaUrl} />
                        Your browser does not support the video tag.
                    </video>
                </div>
            );
        case 'm.audio':
            return (
                <div className="max-w-md">
                    <audio
                        controls
                        className="w-full"
                    >
                        <source src={mediaUrl} />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            );
        default:
            return null;
    }
}
