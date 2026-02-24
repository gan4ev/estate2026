import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const db = locals.runtime.env.DB;
        const formData = await request.formData();

        const title = formData.get('title')?.toString();
        const description = formData.get('description')?.toString();
        const type = formData.get('type')?.toString() || 'apartment';
        const price = Number(formData.get('price')) || 0;
        const bedrooms = Number(formData.get('bedrooms')) || 0;
        const bathrooms = Number(formData.get('bathrooms')) || 0;
        const area_sqm = Number(formData.get('area_sqm')) || 0;

        if (!title) {
            return new Response(JSON.stringify({ error: 'Title is required' }), { status: 400 });
        }

        // Generate UUIDs automatically since D1 doesn't have a native UUID() function built-in everywhere
        const listingId = crypto.randomUUID();
        const i18nId = crypto.randomUUID();

        // Use a transaction/batch to insert both the core listing and the translation
        await db.batch([
            db.prepare(`
        INSERT INTO listings (id, status, price, type, bedrooms, bathrooms, area_sqm)
        VALUES (?, 'draft', ?, ?, ?, ?, ?)
      `).bind(listingId, price, type, bedrooms, bathrooms, area_sqm),

            // Default to English ('en') for the primary translation upon creation
            db.prepare(`
        INSERT INTO listing_i18n (id, listing_id, lang, title, description)
        VALUES (?, ?, 'en', ?, ?)
      `).bind(i18nId, listingId, title, description)
        ]);

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

        // Join listings with their English translation
        const { results } = await db.prepare(`
      SELECT l.*, i.title, i.description 
      FROM listings l
      LEFT JOIN listing_i18n i ON l.id = i.listing_id AND i.lang = 'en'
      ORDER BY l.created_at DESC
    `).all();

        return new Response(JSON.stringify({ success: true, data: results }), { status: 200 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: 'Failed to fetch listings', message: err.message }), { status: 500 });
    }
};
