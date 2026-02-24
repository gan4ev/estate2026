import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals }) => {
    try {
        const db = locals.runtime.env.DB;
        const { id } = params;

        if (!id) return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400 });

        const { results } = await db.prepare(`
            SELECT l.*, i.title, i.description,
            (SELECT json_group_array(extra_key) FROM listing_extras WHERE listing_id = l.id) AS extras,
            (SELECT json_group_array(json_object('id', id, 'r2_key', r2_key, 'is_primary', is_primary, 'sort_order', sort_order)) 
             FROM (SELECT * FROM media WHERE listing_id = l.id ORDER BY sort_order ASC)) AS media
            FROM listings l
            LEFT JOIN listing_i18n i ON l.id = i.listing_id AND i.lang = 'en'
            WHERE l.id = ?
        `).bind(id).all();

        if (!results || results.length === 0) {
            return new Response(JSON.stringify({ error: 'Listing not found' }), { status: 404 });
        }

        const listing = results[0];
        listing.extras = JSON.parse(listing.extras);

        return new Response(JSON.stringify({ success: true, data: listing }), { status: 200 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: 'Failed to fetch listing', message: err.message }), { status: 500 });
    }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
    try {
        const db = locals.runtime.env.DB;
        const { id } = params;

        if (!id) return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400 });

        // ON DELETE CASCADE handles cleaning up listing_i18n and listing_extras
        await db.prepare('DELETE FROM listings WHERE id = ?').bind(id).run();

        return new Response(JSON.stringify({ success: true, message: 'Listing deleted successfully' }), { status: 200 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: 'Failed to delete listing', message: err.message }), { status: 500 });
    }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
    try {
        const db = locals.runtime.env.DB;
        const { id } = params;
        const formData = await request.formData();

        if (!id) return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400 });

        const title = formData.get('title')?.toString();
        const description = formData.get('description')?.toString();
        const main_category = formData.get('main_category')?.toString() || 'for_sale';
        const property_type = formData.get('property_type')?.toString();
        const stage = formData.get('stage')?.toString() || null;
        const price = Number(formData.get('price')) || 0;
        const bedrooms = Number(formData.get('bedrooms')) || 0;
        const bathrooms = Number(formData.get('bathrooms')) || 0;
        const area_sqm = Number(formData.get('area_sqm')) || 0;
        const area_id = formData.get('area_id')?.toString() || null;
        const status = formData.get('status')?.toString() || 'draft';
        const extras = formData.getAll('extras');

        if (!title) {
            return new Response(JSON.stringify({ error: 'Title is required' }), { status: 400 });
        }

        const statements = [
            // Update core listing
            db.prepare(`
                UPDATE listings 
                SET status = ?, price = ?, main_category = ?, property_type = ?, stage = ?, 
                    area_id = ?, bedrooms = ?, bathrooms = ?, area_sqm = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).bind(status, price, main_category, property_type, stage, area_id, bedrooms, bathrooms, area_sqm, id),

            // Update English translation
            db.prepare(`
                UPDATE listing_i18n 
                SET title = ?, description = ?
                WHERE listing_id = ? AND lang = 'en'
            `).bind(title, description, id),

            // Clear and rebuild extras to simplify the logic
            db.prepare(`DELETE FROM listing_extras WHERE listing_id = ?`).bind(id)
        ];

        if (extras && extras.length > 0) {
            for (const extra of extras) {
                statements.push(
                    db.prepare(`INSERT INTO listing_extras (listing_id, extra_key) VALUES (?, ?)`).bind(id, extra.toString())
                );
            }
        }

        await db.batch(statements);

        return new Response(JSON.stringify({ success: true, message: 'Listing updated successfully' }), { status: 200 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: 'Failed to update listing', message: err.message }), { status: 500 });
    }
};
