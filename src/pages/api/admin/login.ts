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

            if (user.password !== password) {
                // Return exact mismatch to the UI so the user can see if there are hidden spaces
                return redirect(`/admin/login?error=DEBUG:+DB+password+is+'${user.password}',+you+typed+'${password}'`);
            } else if (user.role !== 'admin') {
                return redirect(`/admin/login?error=DEBUG:+User+role+is+'${user.role}',+requires+'admin'`);
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
            return redirect(`/admin/login?error=DEBUG:+Email+'${email}'+not+found+in+database.`);
        }
    } catch (err: any) {
        return redirect(`/admin/login?error=Server+Error+${encodeURIComponent(err.message)}`);
    }
};
