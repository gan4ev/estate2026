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
    featured BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for rapid hierarchical filtering and counting at the edge
CREATE INDEX IF NOT EXISTS idx_listings_search ON listings(status, main_category, property_type, stage);

-- Translations for Listings (i18n)
CREATE TABLE IF NOT EXISTS listing_i18n (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    lang TEXT NOT NULL, -- e.g., 'en', 'bg'
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    UNIQUE(listing_id, lang)
);

-- Media table (R2 Object Keys)
CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    r2_key TEXT NOT NULL, -- the key object stored in the R2 bucket
    is_primary BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- M2M Mapping table for dynamic Amenities & Extras (kitchen, furniture, etc)
CREATE TABLE IF NOT EXISTS listing_extras (
    listing_id TEXT NOT NULL,
    extra_key TEXT NOT NULL, -- The dictionary key 'extra.furniture'
    PRIMARY KEY (listing_id, extra_key),
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);
