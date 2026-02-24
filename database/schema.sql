-- D1 Database Schema for Estate 2026 Admin Panel & Listings

-- Admins / Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin', -- e.g., 'admin', 'editor'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions Table (if manual auth is ever needed beyond CF Access)
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Core Listings Data
CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY,
    status TEXT DEFAULT 'draft', -- 'draft', 'published', 'archived'
    price REAL,
    currency TEXT DEFAULT 'EUR',
    type TEXT, -- e.g., 'apartment', 'house', 'commercial'
    bedrooms INTEGER,
    bathrooms INTEGER,
    area_sqm REAL,
    main_category TEXT DEFAULT 'for_sale', -- 'for_sale', 'for_rent'
    property_type TEXT,                    -- 'apartment', 'house', 'penthouse', etc
    stage TEXT,                            -- 'resales', 'new_development', 'off_plan'
    area_id TEXT,                          -- Hierarchical location reference
    featured BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL
);

-- Media / Photos Table
CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    r2_key TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- Listing Extras / Amenities (M2M)
CREATE TABLE IF NOT EXISTS listing_extras (
    listing_id TEXT NOT NULL,
    extra_key TEXT NOT NULL,
    PRIMARY KEY (listing_id, extra_key),
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- Countries
CREATE TABLE IF NOT EXISTS countries (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cities
CREATE TABLE IF NOT EXISTS cities (
    id TEXT PRIMARY KEY,
    country_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
);

-- Areas
CREATE TABLE IF NOT EXISTS areas (
    id TEXT PRIMARY KEY,
    city_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
);

-- Location Translations
CREATE TABLE IF NOT EXISTS location_i18n (
    id TEXT PRIMARY KEY,
    entity_id TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK(entity_type IN ('country', 'city', 'area')),
    lang TEXT NOT NULL,
    name TEXT NOT NULL,
    UNIQUE(entity_id, lang)
);
