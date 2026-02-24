export async function getDictionary(db, lang) {
    if (!db) return null;
    try {
        const { results } = await db.prepare('SELECT dictionary FROM site_translations WHERE lang = ?').bind(lang).all();
        if (results && results.length > 0) {
            return JSON.parse(results[0].dictionary);
        }
    } catch (e) {
        console.error("I18n DB Error:", e);
    }
    return null;
}

export async function getAvailableLanguages(db) {
    if (!db) return ['en', 'bg']; // Safe fallback if DB is missing during build
    try {
        const { results } = await db.prepare('SELECT lang FROM site_translations').all();
        if (results && results.length > 0) {
            return results.map(row => row.lang);
        }
    } catch (e) {
        console.error("I18n DB Error:", e);
    }
    return ['en', 'bg'];
}
