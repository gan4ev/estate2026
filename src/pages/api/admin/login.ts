import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals, cookies, redirect }) => {
    try {
        const data = await request.formData();
        const email = data.get('email')?.toString();
        const password = data.get('password')?.toString();

        if (!email || !password) {
            return redirect('/admin/login?error=Missing+credentials');
        }

        const db = locals.runtime?.env?.DB;
        if (!db) {
            return redirect('/admin/login?error=Database+binding+not+found');
        }

        const { results } = await db.prepare('SELECT * FROM users WHERE email = ? AND password = ? AND role = ?')
            .bind(email, password, 'admin')
            .all();

        if (results && results.length > 0) {
            // Set a secure cookie
            cookies.set('admin_fallback_email', email, {
                path: '/',
                httpOnly: true,
                secure: import.meta.env.PROD,
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });
            return redirect('/admin');
        } else {
            return redirect('/admin/login?error=Invalid+email+or+password');
        }
    } catch (err: any) {
        return redirect(`/admin/login?error=Server+Error+${encodeURIComponent(err.message)}`);
    }
};
