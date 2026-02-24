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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Site Translations for flexible Frontend UI dictionaries
CREATE TABLE IF NOT EXISTS site_translations (
    lang TEXT PRIMARY KEY,       -- e.g., 'en', 'bg', 'pl'
    dictionary TEXT NOT NULL,    -- JSON string of key-value pairs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
