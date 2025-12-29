-- Categories Tablosu Oluşturma
-- Bu dosyayı Supabase SQL Editor'de çalıştırın

-- Categories tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('events', 'news', 'blog', 'projects', 'files')),
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS aktif et
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Politikaları oluştur
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
CREATE POLICY "Enable read access for all users" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON public.categories;
CREATE POLICY "Enable insert for all users" ON public.categories FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON public.categories;
CREATE POLICY "Enable update for all users" ON public.categories FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON public.categories;
CREATE POLICY "Enable delete for all users" ON public.categories FOR DELETE USING (true);

-- Index oluştur
CREATE INDEX IF NOT EXISTS categories_type_idx ON public.categories(type);

-- Başarı mesajı
SELECT 'Categories tablosu başarıyla oluşturuldu!' as message;
