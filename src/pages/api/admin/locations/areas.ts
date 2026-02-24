import type { APIRoute } from 'astro';
import { slugify } from '../../../../lib/slugs.js';

export const GET: APIRoute = async ({ locals }) => {
    try {
        const db = locals.runtime.env.DB;
        const { results } = await db.prepare(`
            SELECT a.*, ci.id as city_id,
            (SELECT name FROM location_i18n WHERE entity_id = a.id AND lang = 'en' AND entity_type = 'area') as name_en,
            (SELECT name FROM location_i18n WHERE entity_id = a.id AND lang = 'bg' AND entity_type = 'area') as name_bg,
            (SELECT slug FROM location_i18n WHERE entity_id = a.id AND lang = 'en' AND entity_type = 'area') as slug_en,
            (SELECT slug FROM location_i18n WHERE entity_id = a.id AND lang = 'bg' AND entity_type = 'area') as slug_bg
            FROM areas a
            JOIN cities ci ON a.city_id = ci.id
            ORDER BY a.created_at DESC
        `).all();

        return new Response(JSON.stringify({ success: true, data: results }), { status: 200 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: 'Failed to fetch areas', message: err.message }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const db = locals.runtime.env.DB;
        const formData = await request.formData();
        const cityId = formData.get('city_id')?.toString();
        const nameEn = formData.get('name_en')?.toString();
        const nameBg = formData.get('name_bg')?.toString();

        if (!cityId || !nameEn) {
            return new Response(JSON.stringify({ error: 'City and English name are required' }), { status: 400 });
        }

        const areaId = crypto.randomUUID();

        const statements = [
            db.prepare(`INSERT INTO areas (id, city_id) VALUES (?, ?)`).bind(areaId, cityId),
            db.prepare(`INSERT INTO location_i18n (id, entity_id, entity_type, lang, name, slug) VALUES (?, ?, 'area', 'en', ?, ?)`).bind(crypto.randomUUID(), areaId, nameEn, slugify(nameEn)),
        ];

        if (nameBg) {
            statements.push(
                db.prepare(`INSERT INTO location_i18n (id, entity_id, entity_type, lang, name, slug) VALUES (?, ?, 'area', 'bg', ?, ?)`).bind(crypto.randomUUID(), areaId, nameBg, slugify(nameBg))
            );
        }

        await db.batch(statements);

        return new Response(JSON.stringify({ success: true, id: areaId }), { status: 201 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: 'Failed to create area', message: err.message }), { status: 500 });
    }
};
