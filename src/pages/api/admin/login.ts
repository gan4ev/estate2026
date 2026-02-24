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

        // Debug mode: Check if the user exists first, ignoring password
        const { results: userCheck } = await db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)')
            .bind(email)
            .all();

        if (userCheck && userCheck.length > 0) {
            const user = userCheck[0];

            if (user.password !== password || user.role !== 'admin') {
                return redirect(`/admin/login?error=Invalid+email+or+password`);
            } else {
                // Success! Set cookie
                cookies.set('admin_fallback_email', user.email, {
                    path: '/',
                    httpOnly: true,
                    secure: import.meta.env.PROD,
                    maxAge: 60 * 60 * 24 * 7 // 1 week
                });
                return redirect('/admin');
            }
        } else {
            return redirect(`/admin/login?error=Invalid+email+or+password`);
        }
    } catch (err: any) {
        return redirect(`/admin/login?error=Server+Error+${encodeURIComponent(err.message)}`);
    }
};
