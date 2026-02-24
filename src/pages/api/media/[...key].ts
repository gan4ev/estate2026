export const prerender = false;
import type { APIRoute } from 'astro';

// Public R2 URL - used as fallback when local R2 binding has no data (dev mode)
const R2_PUBLIC_URL = 'https://pub-4cba27b8006f4b939f87b7129149d1a4.r2.dev';

export const GET: APIRoute = async ({ params, locals, url }) => {
    const key = params.key;

    if (!key) return new Response('Not Found', { status: 404 });

    // Parse optional resize params: ?w=800&q=80
    const width = url.searchParams.get('w') ? parseInt(url.searchParams.get('w')!) : undefined;
    const quality = url.searchParams.get('q') ? parseInt(url.searchParams.get('q')!) : 80;

    try {
        const bucket = locals.runtime?.env?.MEDIA;

        if (bucket) {
            const object = await bucket.get(key);

            if (object) {
                // Production path: use Cloudflare Image Resizing if width is requested
                // (requires CF Pro+ plan — silently passes through on free tier)
                if (width) {
                    const publicUrl = `${R2_PUBLIC_URL}/${key}`;
                    const resized = await fetch(publicUrl, {
                        // @ts-ignore — CF-specific fetch option
                        cf: { image: { width, quality, format: 'webp' } }
                    });
                    if (resized.ok) {
                        return new Response(resized.body, {
                            headers: {
                                'Content-Type': resized.headers.get('Content-Type') || 'image/webp',
                                'Cache-Control': 'public, max-age=31536000, immutable',
                                'Vary': 'Accept',
                            }
                        });
                    }
                }

                // No resize needed or resize failed — serve directly from R2
                const headers = new Headers();
                object.writeHttpMetadata(headers);
                headers.set('etag', object.httpEtag);
                headers.set('Cache-Control', 'public, max-age=31536000, immutable');
                return new Response(object.body, { headers });
            }

            // Object not in local R2 (dev mode) — redirect to public URL
            const redirectUrl = new URL(`${R2_PUBLIC_URL}/${key}`);
            if (width) {
                // In dev, append resize params as hints (CF won't process them on r2.dev)
                redirectUrl.searchParams.set('w', String(width));
            }
            return Response.redirect(redirectUrl.toString(), 302);
        }

        // No binding at all — redirect to public URL
        return Response.redirect(`${R2_PUBLIC_URL}/${key}`, 302);

    } catch (err: any) {
        // On any error, fall back to public URL
        return Response.redirect(`${R2_PUBLIC_URL}/${key}`, 302);
    }
};


