import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, request, locals, cookies, redirect } = context;

    // Allow the fallback login page to pass through completely unhindered
    if (url.pathname === '/admin/login' || url.pathname === '/api/admin/login') {
        return next();
    }

    // Only protect /admin and /api/admin routes
    if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin')) {

        // In local dev, we don't have Cloudflare Access headers, so we bypass or use a mock
        if (import.meta.env.DEV) {
            context.locals.user = { email: 'gan4ev@gmail.com', role: 'admin' };
            return next();
        }

        // Check for Cloudflare Access header OR our fallback cookie
        const cfUserEmail = request.headers.get('Cf-Access-Authenticated-User-Email');
        const fallbackEmailCookie = cookies.get('admin_fallback_email')?.value;

        const emailToVerify = cfUserEmail || fallbackEmailCookie;

        if (!emailToVerify) {
            // Redirect to our fallback login page instead of throwing an ugly 403 error
            return redirect('/admin/login');
        }

        try {
            // Verify this user exists in our D1 database and is an admin
            const db = locals.runtime.env.DB;
            const { results } = await db.prepare('SELECT * FROM users WHERE email = ? AND role = ?')
                .bind(emailToVerify, 'admin')
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
