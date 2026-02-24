-- D1 Database Schema for Multi-language Locations

-- Countries (Root Level)
CREATE TABLE IF NOT EXISTS countries (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL, -- e.g., 'BG', 'ES', 'PL'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cities (Belong to a Country)
CREATE TABLE IF NOT EXISTS cities (
    id TEXT PRIMARY KEY,
    country_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
);

-- Areas / Sub-areas (Belong to a City)
CREATE TABLE IF NOT EXISTS areas (
    id TEXT PRIMARY KEY,
    city_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
);

-- Unified Location Translations Table
-- entity_type defines if it's a country, city, or area
CREATE TABLE IF NOT EXISTS location_i18n (
    id TEXT PRIMARY KEY,
    entity_id TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK(entity_type IN ('country', 'city', 'area')),
    lang TEXT NOT NULL, -- 'en', 'bg', etc.
    name TEXT NOT NULL,
    UNIQUE(entity_id, lang)
);

-- Add area_id to listings table (Incremental migration)
-- This will be handled via a separate ALTER TABLE if the table already exists
-- but for the schema.sql it should be part of the definition.
