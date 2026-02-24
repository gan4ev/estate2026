export const prerender = false;
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const db = locals.runtime.env.DB;
        const bucket = locals.runtime.env.MEDIA;
        const formData = await request.formData();
        const listingId = formData.get('listing_id')?.toString();
        const files = formData.getAll('files') as File[];

        if (!listingId || files.length === 0) {
            return new Response(JSON.stringify({ error: 'listing_id and files are required' }), { status: 400 });
        }

        const uploadedMedia = [];

        for (const file of files) {
            const fileId = crypto.randomUUID();
            const extension = file.name.split('.').pop();
            const r2Key = `listings/${listingId}/${fileId}.${extension}`;

            // Upload to R2 with long-lived cache headers
            await bucket.put(r2Key, file, {
                httpMetadata: {
                    contentType: file.type,
                    cacheControl: 'public, max-age=31536000, immutable',
                }
            });

            // Get current max sort order for this listing
            const { results } = await db.prepare(`SELECT MAX(sort_order) as max_sort FROM media WHERE listing_id = ?`).bind(listingId).all();
            const nextSort = (results[0]?.max_sort || 0) + 1;

            // Insert into D1
            await db.prepare(`
                INSERT INTO media (id, listing_id, r2_key, sort_order)
                VALUES (?, ?, ?, ?)
            `).bind(fileId, listingId, r2Key, nextSort).run();

            uploadedMedia.push({ id: fileId, r2Key });
        }

        return new Response(JSON.stringify({ success: true, data: uploadedMedia }), { status: 201 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: 'Upload failed', message: err.message }), { status: 500 });
    }
};
