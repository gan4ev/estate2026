import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals }) => {
    try {
        const bucket = locals.runtime.env.MEDIA;
        const key = params.key;

        if (!key) return new Response('Not Found', { status: 404 });

        const object = await bucket.get(key);

        if (!object) {
            return new Response('Not Found', { status: 404 });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

        return new Response(object.body, {
            headers,
        });
    } catch (err: any) {
        return new Response('Error fetching image', { status: 500 });
    }
};
