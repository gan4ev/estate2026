import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, locals }) => {
    try {
        const db = locals.runtime?.env?.DB;
        if (!db) return new Response(JSON.stringify({ error: "No DB binding" }), { status: 500 });

        const url = new URL(request.url);
        const lang = url.searchParams.get('lang');

        if (lang) {
            const { results } = await db.prepare('SELECT dictionary FROM site_translations WHERE lang = ?').bind(lang).all();
            if (results && results.length > 0) {
                return new Response(JSON.stringify({ lang, dictionary: JSON.parse(results[0].dictionary) }));
            }
            return new Response(JSON.stringify({ error: "Language not found" }), { status: 404 });
        } else {
            const { results } = await db.prepare('SELECT lang, created_at, updated_at FROM site_translations ORDER BY lang').all();
            return new Response(JSON.stringify(results));
        }
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const db = locals.runtime?.env?.DB;
        if (!db) return new Response(JSON.stringify({ error: "No DB binding" }), { status: 500 });

        const data = await request.json();
        const { lang, dictionary } = data;

        if (!lang || !dictionary) {
            return new Response(JSON.stringify({ error: "Missing lang or dictionary" }), { status: 400 });
        }

        await db.prepare('INSERT OR REPLACE INTO site_translations (lang, dictionary, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)')
            .bind(lang, JSON.stringify(dictionary))
            .run();

        return new Response(JSON.stringify({ success: true }));
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export const DELETE: APIRoute = async ({ request, locals }) => {
    try {
        const db = locals.runtime?.env?.DB;
        if (!db) return new Response(JSON.stringify({ error: "No DB binding" }), { status: 500 });

        const url = new URL(request.url);
        const lang = url.searchParams.get('lang');

        if (!lang) return new Response(JSON.stringify({ error: "Missing lang" }), { status: 400 });
        if (lang === 'en') return new Response(JSON.stringify({ error: "Cannot delete base english mapping" }), { status: 400 });

        await db.prepare('DELETE FROM site_translations WHERE lang = ?').bind(lang).run();

        return new Response(JSON.stringify({ success: true }));
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
