import type { APIRoute } from 'astro';

export const PATCH: APIRoute = async ({ request, locals }) => {
    try {
        const db = locals.runtime.env.DB;
        const { mediaIds } = await request.json();

        if (!Array.isArray(mediaIds)) {
            return new Response(JSON.stringify({ error: 'mediaIds array is required' }), { status: 400 });
        }

        const statements = mediaIds.map((id, index) =>
            db.prepare(`UPDATE media SET sort_order = ? WHERE id = ?`).bind(index + 1, id)
        );

        await db.batch(statements);

        return new Response(JSON.stringify({ success: true, message: 'Sort order updated' }), { status: 200 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: 'Sorting failed', message: err.message }), { status: 500 });
    }
};
