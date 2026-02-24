const dicts = import.meta.glob('../i18n/*.json', { eager: true });

export function t(lang, key) {
    const langPath = `../i18n/${lang}.json`;
    const enPath = `../i18n/en.json`;

    const dictionary = dicts[langPath]?.default || dicts[enPath]?.default || {};
    const fallback = dicts[enPath]?.default || {};

    return dictionary[key] || fallback[key] || key;
}

export function getAvailableLanguages() {
    return Object.keys(dicts).map(path => path.match(/([a-zA-Z-]+)\.json$/)[1]);
}
