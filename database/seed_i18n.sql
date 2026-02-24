-- Initial Dictionary Seeds from static i18n JSON files

INSERT OR REPLACE INTO site_translations (lang, dictionary) VALUES (
    'en',
    '{
        "title": "Estate 2026",
        "nav.home": "Home",
        "nav.contact": "Contact",
        "hero.headline": "Find Your Dream Home",
        "hero.cta": "View Properties"
    }'
);

INSERT OR REPLACE INTO site_translations (lang, dictionary) VALUES (
    'bg',
    '{
        "title": "Имоти 2026",
        "nav.home": "Начало",
        "nav.contact": "Контакти",
        "hero.headline": "Намери Своя Мечтан Дом",
        "hero.cta": "Разгледай Имоти"
    }'
);
