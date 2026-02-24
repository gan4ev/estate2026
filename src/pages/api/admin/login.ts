import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals, cookies, redirect }) => {
    try {
        const data = await request.formData();
        const email = data.get('email')?.toString().trim();
        const password = data.get('password')?.toString().trim();

        if (!email || !password) {
            return redirect('/admin/login?error=Missing+credentials');
        }

        const db = locals.runtime?.env?.DB;
        if (!db) {
            return redirect('/admin/login?error=Database+binding+not+found');
        }

        console.log(`[API Login] Attempting DB auth for: "${email}" with password: "${password}"`);
        const { results } = await db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND password = ? AND role = ?')
            .bind(email, password, 'admin')
            .all();

        console.log(`[API Login] Auth query returned ${results?.length} records`);

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
