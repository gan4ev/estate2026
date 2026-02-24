import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, request, locals, cookies, redirect } = context;

    // 1. Try to identify the user globally on every request so the frontend can see if they are logged in
    let emailToVerify = request.headers.get('Cf-Access-Authenticated-User-Email') || cookies.get('admin_fallback_email')?.value;

    if (emailToVerify) {
        emailToVerify = decodeURIComponent(emailToVerify);
    }

    // In local dev, we don't have Cloudflare Access headers, so we mock it if dev login cookie is missing
    if (import.meta.env.DEV && !emailToVerify) {
        // Optional: You could mock a login here, but since we built a local login page, let's just let it be null unless they log in.
        // emailToVerify = 'gan4ev@gmail.com'; 
    }

    if (emailToVerify) {
        try {
            console.log("[Auth] emailToVerify:", emailToVerify);
            const db = locals.runtime?.env?.DB;
            console.log("[Auth] DB runtime status:", !!db);

            if (db) {
                const { results } = await db.prepare('SELECT * FROM users WHERE email = ? AND role = ?')
                    .bind(emailToVerify, 'admin')
                    .all();

                console.log("[Auth] DB Results count:", results?.length);
                if (results && results.length > 0) {
                    context.locals.user = results[0]; // Populate user globally
                }
            } else {
                console.log("[Auth] DB binding is missing!");
            }
        } catch (err) {
            console.error("Middleware DB error:", err);
        }
    }

    // 2. Route Protection Logic
    if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin')) {

        // Allow the login pages to pass through unprotected
        if (url.pathname === '/admin/login' || url.pathname === '/api/admin/login') {
            // If they are already logged in, no need to see the login page
            if (context.locals.user) return redirect('/admin');
            return next();
        }

        // If they are trying to access a protected route and NOT logged in, redirect to login
        if (!context.locals.user) {
            return redirect('/admin/login');
        }
    }

    return next();
});
