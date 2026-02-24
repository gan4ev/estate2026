-- Backfill slugs for local DB
UPDATE listing_i18n SET slug = 'wewe', meta_title = 'wewe', meta_description = 'wewe' WHERE title = 'wewe';
UPDATE listing_i18n SET slug = 'nice-property', meta_title = 'Nice property ', meta_description = 'Nice property ' WHERE title LIKE 'Nice property%';

-- Locations
UPDATE location_i18n SET slug = 'bulgaria' WHERE name = 'Bulgaria';
UPDATE location_i18n SET slug = 'bulgaria' WHERE name = 'България';
UPDATE location_i18n SET slug = 'sofia' WHERE name = 'Sofia';
UPDATE location_i18n SET slug = 'sofia' WHERE name = 'София';
UPDATE location_i18n SET slug = 'mladost' WHERE name = 'Mladost';
UPDATE location_i18n SET slug = 'mladost' WHERE name = 'Младост';
UPDATE location_i18n SET slug = 'poland' WHERE name = 'Poland';
UPDATE location_i18n SET slug = 'polsha' WHERE name = 'Полша';
UPDATE location_i18n SET slug = 'poznan' WHERE name = 'Poznan';
UPDATE location_i18n SET slug = 'poznan' WHERE name = 'Познан';
