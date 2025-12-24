-- Fix missing columns and reload schema cache

-- Add missing columns if not exists
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS metaDescription TEXT;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS metaTitle TEXT;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS showInSlider BOOLEAN DEFAULT false;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS publishStatus TEXT DEFAULT 'draft';

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS full_content TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS metaDescription TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS metaTitle TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS showInSlider BOOLEAN DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS publishStatus TEXT DEFAULT 'draft';

ALTER TABLE public.blog ADD COLUMN IF NOT EXISTS metaDescription TEXT;
ALTER TABLE public.blog ADD COLUMN IF NOT EXISTS metaTitle TEXT;
ALTER TABLE public.blog ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.blog ADD COLUMN IF NOT EXISTS showInSlider BOOLEAN DEFAULT false;
ALTER TABLE public.blog ADD COLUMN IF NOT EXISTS publishStatus TEXT DEFAULT 'draft';

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS metaDescription TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS metaTitle TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS showInSlider BOOLEAN DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS publishStatus TEXT DEFAULT 'draft';

-- Ensure GRANTS are in place
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Force PostgREST schema reload
SELECT pg_notify('pgrst', 'reload schema');
