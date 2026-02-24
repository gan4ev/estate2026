import type { APIRoute } from 'astro';

export const DELETE: APIRoute = async ({ params, locals }) => {
    try {
        const db = locals.runtime.env.DB;
        const bucket = locals.runtime.env.MEDIA;
        const { id } = params;

        if (!id) return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400 });

        // 1. Get R2 key before deleting
        const { results } = await db.prepare(`SELECT r2_key FROM media WHERE id = ?`).bind(id).all();
        const media = results[0];

        if (!media) {
            return new Response(JSON.stringify({ error: 'Media not found' }), { status: 404 });
        }

        // 2. Delete from R2
        await bucket.delete(media.r2_key);

        // 3. Delete from D1
        await db.prepare(`DELETE FROM media WHERE id = ?`).bind(id).run();

        return new Response(JSON.stringify({ success: true, message: 'Media deleted successfully' }), { status: 200 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: 'Deletion failed', message: err.message }), { status: 500 });
    }
};
