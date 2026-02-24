import en from '../i18n/en.json';
import bg from '../i18n/bg.json';

const dictionaries = {
    en,
    bg
};

export async function getDictionary(db, lang) {
    // Priority 1: Static Files (Fastest)
    if (dictionaries[lang]) {
        return dictionaries[lang];
    }

    // Fallback: If we ever add more languages dynamically via DB back in the future
    // but the user specifically asked for files now.
    return dictionaries['en'];
}

export async function getAvailableLanguages(db) {
    return Object.keys(dictionaries);
}

