export const prerender = false;
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies, redirect }) => {
    // Delete the fallback authentication cookie
    cookies.delete('admin_fallback_email', { path: '/' });

    // Send the user back to the homepage
    return redirect('/bg');
};
