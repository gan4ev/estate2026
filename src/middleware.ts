import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, request, locals } = context;

    // Only protect /admin and /api/admin routes
    if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin')) {

        // In local dev, we don't have Cloudflare Access headers, so we bypass or use a mock
        if (import.meta.env.DEV) {
            context.locals.user = { email: 'gan4ev@gmail.com', role: 'admin' };
            return next();
        }

        // In production, look for the Cloudflare Access authenticated email header
        const cfUserEmail = request.headers.get('Cf-Access-Authenticated-User-Email');

        if (!cfUserEmail) {
            // If no header, they shouldn't even be here (Cloudflare Access should block them first)
            // But just in case Access is misconfigured, return 403 Forbidden.
            return new Response('Unauthorized: Missing Cloudflare Access', { status: 403 });
        }

        try {
            // Verify this user exists in our D1 database and is an admin
            const db = locals.runtime.env.DB;
            const { results } = await db.prepare('SELECT * FROM users WHERE email = ? AND role = ?')
                .bind(cfUserEmail, 'admin')
                .all();

            if (!results || results.length === 0) {
                return new Response('Forbidden: User is not an authorized admin', { status: 403 });
            }

            // User exists and is an admin, attach them to locals for the downstream pages to use
            context.locals.user = results[0];
            return next();

        } catch (err: any) {
            return new Response('Internal Server Error checking admin authorization', { status: 500 });
        }
    }

    // Not an admin route, let it pass through
    return next();
});
