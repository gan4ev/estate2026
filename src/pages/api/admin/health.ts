export const prerender = false;
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
    try {
        const db = locals.runtime.env.DB;

        // Run a basic test query to ensure D1 is connected
        const { results } = await db.prepare('SELECT 1 as connected').all();

        return new Response(
            JSON.stringify({
                status: 'success',
                message: 'D1 database connected successfully',
                data: results
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (err: any) {
        return new Response(
            JSON.stringify({
                status: 'error',
                message: 'Failed to connect to D1 database',
                error: err.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};
