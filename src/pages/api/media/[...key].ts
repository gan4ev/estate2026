import type { APIRoute } from 'astro';

// Public R2 URL for development fallback
const R2_PUBLIC_URL = 'https://pub-4cba27b8006f4b939f87b7129149d1a4.r2.dev';

export const GET: APIRoute = async ({ params, locals }) => {
    const key = params.key;

    if (!key) return new Response('Not Found', { status: 404 });

    try {
        const bucket = locals.runtime?.env?.MEDIA;

        // If local R2 binding exists, use it directly
        if (bucket) {
            const object = await bucket.get(key);

            if (!object) {
                return new Response('Not Found', { status: 404 });
            }

            const headers = new Headers();
            object.writeHttpMetadata(headers);
            headers.set('etag', object.httpEtag);
            headers.set('Cache-Control', 'public, max-age=31536000');

            return new Response(object.body, { headers });
        }

        // Development fallback: proxy from public R2 URL
        const publicUrl = `${R2_PUBLIC_URL}/${key}`;
        const res = await fetch(publicUrl);

        if (!res.ok) {
            return new Response('Not Found', { status: 404 });
        }

        return new Response(res.body, {
            headers: {
                'Content-Type': res.headers.get('Content-Type') || 'image/jpeg',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (err: any) {
        return new Response('Error fetching image', { status: 500 });
    }
};
