-- Migration: Add multi-category support to all content tables
-- Date: 2026-01-30
-- Description: Add categories (text[]) column to news, events, projects, blog, and files tables

-- News table
ALTER TABLE news ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';
UPDATE news SET categories = ARRAY[kategori] WHERE kategori IS NOT NULL AND kategori != '' AND (categories IS NULL OR categories = '{}');

-- Events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';
UPDATE events SET categories = ARRAY[kategori] WHERE kategori IS NOT NULL AND kategori != '' AND (categories IS NULL OR categories = '{}');

-- Projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';
UPDATE projects SET categories = ARRAY[category] WHERE category IS NOT NULL AND category != '' AND (categories IS NULL OR categories = '{}');

-- Blog table
ALTER TABLE blog ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';
UPDATE blog SET categories = ARRAY[category] WHERE category IS NOT NULL AND category != '' AND (categories IS NULL OR categories = '{}');

-- Files table
ALTER TABLE files ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';
UPDATE files SET categories = ARRAY[category] WHERE category IS NOT NULL AND category != '' AND (categories IS NULL OR categories = '{}');
