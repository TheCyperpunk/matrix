'use client';

import { useState, useEffect } from 'react';

interface LinkPreviewProps {
    url: string;
}

interface PreviewData {
    title: string | null;
    description: string | null;
    image: string | null;
    url: string;
}

export default function LinkPreview({ url }: LinkPreviewProps) {
    const [data, setData] = useState<PreviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPreview = async () => {
            try {
                const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
                if (!response.ok) throw new Error('Failed to fetch preview');
                const previewData = await response.json();

                if (!previewData.title && !previewData.image) {
                    throw new Error('No preview data found');
                }

                setData(previewData);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPreview();
    }, [url]);

    if (loading) return null; // Don't show loading state to avoid clutter
    if (error || !data) return null;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 max-w-md bg-[#1a1d21] border border-[#2c333a] rounded-lg overflow-hidden hover:bg-[#21262C] transition-colors group"
        >
            <div className="flex flex-col">
                {data.image && (
                    <div className="relative h-48 w-full overflow-hidden bg-black/20">
                        <img
                            src={data.image}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                )}
                <div className="p-3">
                    <h4 className="text-sm font-semibold text-gray-200 line-clamp-1 mb-1">
                        {data.title || url}
                    </h4>
                    {data.description && (
                        <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                            {data.description}
                        </p>
                    )}
                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="truncate">{new URL(url).hostname}</span>
                    </div>
                </div>
            </div>
        </a>
    );
}
