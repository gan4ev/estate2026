export const prerender = false;
import type { APIRoute } from 'astro';
import { slugify } from '../../../../lib/slugs.js';

export const GET: APIRoute = async ({ locals }) => {
    try {
        const db = locals.runtime.env.DB;
        // Fetch countries with their English and Bulgarian names from location_i18n
        const { results } = await db.prepare(`
            SELECT c.*, 
            (SELECT name FROM location_i18n WHERE entity_id = c.id AND lang = 'en' AND entity_type = 'country') as name_en,
            (SELECT name FROM location_i18n WHERE entity_id = c.id AND lang = 'bg' AND entity_type = 'country') as name_bg,
            (SELECT slug FROM location_i18n WHERE entity_id = c.id AND lang = 'en' AND entity_type = 'country') as slug_en,
            (SELECT slug FROM location_i18n WHERE entity_id = c.id AND lang = 'bg' AND entity_type = 'country') as slug_bg
            FROM countries c
            ORDER BY created_at DESC
        `).all();

        return new Response(JSON.stringify({ success: true, data: results }), { status: 200 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: 'Failed to fetch countries', message: err.message }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const db = locals.runtime.env.DB;
        const formData = await request.formData();
        const code = formData.get('code')?.toString().toUpperCase();
        const nameEn = formData.get('name_en')?.toString();
        const nameBg = formData.get('name_bg')?.toString();

        if (!code || !nameEn) {
            return new Response(JSON.stringify({ error: 'Code and English name are required' }), { status: 400 });
        }

        const countryId = crypto.randomUUID();

        const statements = [
            db.prepare(`INSERT INTO countries (id, code) VALUES (?, ?)`).bind(countryId, code),
            db.prepare(`INSERT INTO location_i18n (id, entity_id, entity_type, lang, name, slug) VALUES (?, ?, 'country', 'en', ?, ?)`).bind(crypto.randomUUID(), countryId, nameEn, slugify(nameEn)),
        ];

        if (nameBg) {
            statements.push(
                db.prepare(`INSERT INTO location_i18n (id, entity_id, entity_type, lang, name, slug) VALUES (?, ?, 'country', 'bg', ?, ?)`).bind(crypto.randomUUID(), countryId, nameBg, slugify(nameBg))
            );
        }

        await db.batch(statements);

        return new Response(JSON.stringify({ success: true, id: countryId }), { status: 201 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: 'Failed to create country', message: err.message }), { status: 500 });
    }
};
