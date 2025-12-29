-- Admin Settings Tablosunu Başlatma
-- Bu dosyayı Supabase SQL Editor'de çalıştırın

-- Settings tablosunu oluştur (zaten varsa atla)
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) aktif et
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Politikaları temizle ve yeniden oluştur
DROP POLICY IF EXISTS "Enable read access for all users" ON public.settings;
CREATE POLICY "Enable read access for all users" ON public.settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON public.settings;
CREATE POLICY "Enable insert for all users" ON public.settings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON public.settings;
CREATE POLICY "Enable update for all users" ON public.settings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON public.settings;
CREATE POLICY "Enable delete for all users" ON public.settings FOR DELETE USING (true);

-- Varsayılan admin bilgilerini ekle
INSERT INTO public.settings (key, value, updated_at) 
VALUES 
    ('admin_email', 'admin@spolder.org', NOW()),
    ('admin_password', 'spolder2024', NOW())
ON CONFLICT (key) DO NOTHING;

-- Sonuç kontrolü
SELECT * FROM public.settings WHERE key IN ('admin_email', 'admin_password');
