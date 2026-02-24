/**
 * Simple transliteration mapping for Bulgarian Cyrillic to Latin
 */
const cyrillicMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh', 'з': 'z',
    'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
    'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
    'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y', 'ю': 'yu', 'я': 'ya'
};

/**
 * Generates an SEO-friendly slug from a string, handles Bulgarian Cyrillic
 * @param {string} text 
 * @returns {string}
 */
export function slugify(text) {
    if (!text) return '';

    let slug = text.toLowerCase();

    // Transliterate Cyrillic
    let result = '';
    for (const char of slug) {
        result += cyrillicMap[char] || char;
    }

    return result
        .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
        .replace(/-+/g, '-')       // Replace multiple hyphens with one
        .replace(/^-+|-+$/g, '');  // Trim hyphens from ends
}
