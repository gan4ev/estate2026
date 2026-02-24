import type { APIRoute } from 'astro';

// Public R2 URL - used as fallback when local R2 binding has no data (dev mode)
const R2_PUBLIC_URL = 'https://pub-4cba27b8006f4b939f87b7129149d1a4.r2.dev';

export const GET: APIRoute = async ({ params, locals }) => {
    const key = params.key;

    if (!key) return new Response('Not Found', { status: 404 });

    try {
        const bucket = locals.runtime?.env?.MEDIA;

        // If local R2 binding exists, try it first
        if (bucket) {
            const object = await bucket.get(key);

            if (object) {
                const headers = new Headers();
                object.writeHttpMetadata(headers);
                headers.set('etag', object.httpEtag);
                headers.set('Cache-Control', 'public, max-age=31536000');
                return new Response(object.body, { headers });
            }

            // Object not in local R2 (dev mode) — redirect to public URL
            return Response.redirect(`${R2_PUBLIC_URL}/${key}`, 302);
        }

        // No binding at all — redirect to public URL
        return Response.redirect(`${R2_PUBLIC_URL}/${key}`, 302);

    } catch (err: any) {
        // On any error, try redirecting to public URL as final fallback
        return Response.redirect(`${R2_PUBLIC_URL}/${key}`, 302);
    }
};

