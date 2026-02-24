import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const db = locals.runtime.env.DB;
        const formData = await request.formData();

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
        const extras = formData.getAll('extras'); // M2M Array

        if (!title) {
            return new Response(JSON.stringify({ error: 'Title is required' }), { status: 400 });
        }

        const listingId = crypto.randomUUID();
        const i18nId = crypto.randomUUID();

        // 1. Build the core structural transactions
        const statements = [
            db.prepare(`
                INSERT INTO listings (id, status, price, main_category, property_type, stage, area_id, bedrooms, bathrooms, area_sqm)
                VALUES (?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(listingId, price, main_category, property_type, stage, area_id, bedrooms, bathrooms, area_sqm),

            db.prepare(`
                INSERT INTO listing_i18n (id, listing_id, lang, title, description)
                VALUES (?, ?, 'en', ?, ?)
            `).bind(i18nId, listingId, title, description)
        ];

        // 2. Append all the M2M Amenity linkages gracefully
        if (extras && extras.length > 0) {
            for (const extra of extras) {
                statements.push(
                    db.prepare(`INSERT INTO listing_extras (listing_id, extra_key) VALUES (?, ?)`).bind(listingId, extra.toString())
                );
            }
        }

        // 3. Batch execute to ensure referential integrity on the Edge
        await db.batch(statements);

        return new Response(JSON.stringify({
            success: true,
            id: listingId,
            message: 'Listing created successfully'
        }), { status: 201 });

    } catch (err: any) {
        return new Response(JSON.stringify({
            error: 'Failed to create listing',
            message: err.message
        }), { status: 500 });
    }
};

export const GET: APIRoute = async ({ locals }) => {
    try {
        const db = locals.runtime.env.DB;

        // Join listings with their English translation and aggregate extras into a JSON array string dynamically
        const { results } = await db.prepare(`
      SELECT l.*, i.title, i.description,
      (SELECT name FROM location_i18n WHERE entity_id = l.area_id AND lang = 'en' AND entity_type = 'area') AS area_name,
      (SELECT json_group_array(extra_key) FROM listing_extras WHERE listing_id = l.id) AS extras
      FROM listings l
      LEFT JOIN listing_i18n i ON l.id = i.listing_id AND i.lang = 'en'
      ORDER BY l.created_at DESC
    `).all();

        return new Response(JSON.stringify({ success: true, data: results }), { status: 200 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: 'Failed to fetch listings', message: err.message }), { status: 500 });
    }
};
