import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        // Validate URL
        new URL(url);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Matrix-Chat-Bot/1.0 (compatible; LinkPreview/1.0)',
            },
            signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch URL' }, { status: response.status });
        }

        const html = await response.text();

        // Simple regex to extract OG tags
        const getMetaTag = (property: string) => {
            const regex = new RegExp(`<meta[^>]+property=["']og:${property}["'][^>]+content=["']([^"']+)["']`, 'i');
            const match = html.match(regex);
            return match ? match[1] : null;
        };

        const getTitle = () => {
            const ogTitle = getMetaTag('title');
            if (ogTitle) return ogTitle;
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            return titleMatch ? titleMatch[1] : null;
        };

        const getDescription = () => {
            const ogDesc = getMetaTag('description');
            if (ogDesc) return ogDesc;
            const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
            return descMatch ? descMatch[1] : null;
        };

        const getImage = () => {
            return getMetaTag('image');
        };

        const data = {
            title: getTitle(),
            description: getDescription(),
            image: getImage(),
            url: url,
        };

        // Cache for 1 hour
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
        });

    } catch (error) {
        console.error('Link preview error:', error);
        return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 });
    }
}
