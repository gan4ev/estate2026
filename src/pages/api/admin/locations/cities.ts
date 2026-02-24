import type { APIRoute } from 'astro';
import { slugify } from '../../../../lib/slugs.js';

export const GET: APIRoute = async ({ locals }) => {
    try {
        const db = locals.runtime.env.DB;
        const { results } = await db.prepare(`
            SELECT c.*, co.code as country_code,
            (SELECT name FROM location_i18n WHERE entity_id = c.id AND lang = 'en' AND entity_type = 'city') as name_en,
            (SELECT name FROM location_i18n WHERE entity_id = c.id AND lang = 'bg' AND entity_type = 'city') as name_bg,
            (SELECT slug FROM location_i18n WHERE entity_id = c.id AND lang = 'en' AND entity_type = 'city') as slug_en,
            (SELECT slug FROM location_i18n WHERE entity_id = c.id AND lang = 'bg' AND entity_type = 'city') as slug_bg
            FROM cities c
            JOIN countries co ON c.country_id = co.id
            ORDER BY c.created_at DESC
        `).all();

        return new Response(JSON.stringify({ success: true, data: results }), { status: 200 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: 'Failed to fetch cities', message: err.message }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const db = locals.runtime.env.DB;
        const formData = await request.formData();
        const countryId = formData.get('country_id')?.toString();
        const nameEn = formData.get('name_en')?.toString();
        const nameBg = formData.get('name_bg')?.toString();

        if (!countryId || !nameEn) {
            return new Response(JSON.stringify({ error: 'Country and English name are required' }), { status: 400 });
        }

        const cityId = crypto.randomUUID();

        const statements = [
            db.prepare(`INSERT INTO cities (id, country_id) VALUES (?, ?)`).bind(cityId, countryId),
            db.prepare(`INSERT INTO location_i18n (id, entity_id, entity_type, lang, name, slug) VALUES (?, ?, 'city', 'en', ?, ?)`).bind(crypto.randomUUID(), cityId, nameEn, slugify(nameEn)),
        ];

        if (nameBg) {
            statements.push(
                db.prepare(`INSERT INTO location_i18n (id, entity_id, entity_type, lang, name, slug) VALUES (?, ?, 'city', 'bg', ?, ?)`).bind(crypto.randomUUID(), cityId, nameBg, slugify(nameBg))
            );
        }

        await db.batch(statements);

        return new Response(JSON.stringify({ success: true, id: cityId }), { status: 201 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: 'Failed to create city', message: err.message }), { status: 500 });
    }
};
