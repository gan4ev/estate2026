-- Migration to add SEO slugs and metadata support

-- Add columns to listing_i18n
ALTER TABLE listing_i18n ADD COLUMN slug TEXT;
ALTER TABLE listing_i18n ADD COLUMN meta_title TEXT;
ALTER TABLE listing_i18n ADD COLUMN meta_description TEXT;

-- Add slug column to location_i18n
ALTER TABLE location_i18n ADD COLUMN slug TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_listing_i18n_slug ON listing_i18n(slug);
CREATE INDEX IF NOT EXISTS idx_location_i18n_slug ON location_i18n(slug);
