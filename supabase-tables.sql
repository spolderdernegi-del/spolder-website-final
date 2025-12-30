-- SPOLDER Admin Panel Tabloları

-- Categories tablosu
CREATE TABLE IF NOT EXISTS public.categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Board tablosu
CREATE TABLE IF NOT EXISTS public.board (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    position TEXT,
    bio TEXT,
    image TEXT,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank Info tablosu
CREATE TABLE IF NOT EXISTS public.bank_info (
    id BIGSERIAL PRIMARY KEY,
    bankName TEXT,
    accountHolder TEXT,
    iban TEXT,
    accountNumber TEXT,
    branch TEXT,
    swift TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events tablosu
CREATE TABLE IF NOT EXISTS public.events (
    id BIGSERIAL PRIMARY KEY,
    baslik TEXT NOT NULL,
    ozet TEXT,
    icerik TEXT,
    tarih TEXT,
    saat TEXT,
    konum TEXT,
    konum_lat DOUBLE PRECISION DEFAULT 0,
    konum_lng DOUBLE PRECISION DEFAULT 0,
    gorsel TEXT,
    kategori TEXT,
    kapasite TEXT,
    kayitli TEXT DEFAULT '0',
    durum TEXT DEFAULT 'Açık',
    yayin_durumu TEXT DEFAULT 'taslak',
    sliderda_goster BOOLEAN DEFAULT false,
    slug TEXT,
    meta_baslik TEXT,
    meta_aciklama TEXT,
    google_form_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- News tablosu
CREATE TABLE IF NOT EXISTS public.news (
    id BIGSERIAL PRIMARY KEY,
    baslik TEXT NOT NULL,
    ozet TEXT,
    icerik TEXT,
    gorsel TEXT,
    kategori TEXT,
    yazar TEXT,
    tarih TEXT,
    yayin_durumu TEXT DEFAULT 'taslak',
    sliderda_goster BOOLEAN DEFAULT false,
    slug TEXT,
    meta_baslik TEXT,
    meta_aciklama TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog tablosu
CREATE TABLE IF NOT EXISTS public.blog (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    image TEXT,
    category TEXT,
    author TEXT,
    date TEXT,
    "publishStatus" TEXT DEFAULT 'draft',
    "showInSlider" BOOLEAN DEFAULT false,
    slug TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects tablosu
CREATE TABLE IF NOT EXISTS public.projects (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    image TEXT,
    category TEXT,
    status TEXT DEFAULT 'Devam Ediyor',
    start_date TEXT,
    end_date TEXT,
    "publishStatus" TEXT DEFAULT 'draft',
    "showInSlider" BOOLEAN DEFAULT false,
    slug TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Files tablosu
CREATE TABLE IF NOT EXISTS public.files (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    file_type TEXT,
    file_size BIGINT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings tablosu (Admin giriş bilgileri)
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) Politikaları
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları kaldır (varsa)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.board;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.bank_info;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.events;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.news;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.blog;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.projects;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.files;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.settings;

DROP POLICY IF EXISTS "Enable insert for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.board;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.bank_info;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.events;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.news;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.blog;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.projects;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.files;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.settings;

DROP POLICY IF EXISTS "Enable update for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable update for all users" ON public.board;
DROP POLICY IF EXISTS "Enable update for all users" ON public.bank_info;
DROP POLICY IF EXISTS "Enable update for all users" ON public.events;
DROP POLICY IF EXISTS "Enable update for all users" ON public.news;
DROP POLICY IF EXISTS "Enable update for all users" ON public.blog;
DROP POLICY IF EXISTS "Enable update for all users" ON public.projects;
DROP POLICY IF EXISTS "Enable update for all users" ON public.files;
DROP POLICY IF EXISTS "Enable update for all users" ON public.settings;

DROP POLICY IF EXISTS "Enable delete for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.board;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.bank_info;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.events;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.news;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.blog;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.projects;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.files;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.settings;

-- Public SELECT (herkes okuyabilir)
CREATE POLICY "Enable read access for all users" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.board FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.bank_info FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.events FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.news FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.blog FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.files FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.settings FOR SELECT USING (true);

-- Public INSERT (herkes ekleyebilir)
CREATE POLICY "Enable insert for all users" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON public.board FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON public.bank_info FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON public.news FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON public.blog FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON public.files FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON public.settings FOR INSERT WITH CHECK (true);

-- Public UPDATE (herkes güncelleyebilir)
CREATE POLICY "Enable update for all users" ON public.categories FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON public.board FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON public.bank_info FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON public.events FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON public.news FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON public.blog FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON public.files FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON public.settings FOR UPDATE USING (true);

-- Public DELETE (herkes silebilir)
CREATE POLICY "Enable delete for all users" ON public.categories FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON public.board FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON public.bank_info FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON public.events FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON public.news FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON public.blog FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON public.projects FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON public.files FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON public.settings FOR DELETE USING (true);

-- Varsayılan admin bilgilerini ekle
INSERT INTO public.settings (key, value, updated_at) 
VALUES 
    ('admin_email', 'admin@spolder.org', NOW()),
    ('admin_password', 'spolder2024', NOW())
ON CONFLICT (key) DO NOTHING;

-- Yayınlar için sabit kategorileri ekle (silinemez/düzenlenemez)
INSERT INTO public.categories (name, type, color, created_at, updated_at)
VALUES 
    ('Rapor', 'files', '#3B82F6', NOW(), NOW()),
    ('Araştırma', 'files', '#10B981', NOW(), NOW()),
    ('Politika Belgesi', 'files', '#8B5CF6', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Indexes (performans için)
CREATE INDEX IF NOT EXISTS categories_type_idx ON public.categories(type);
CREATE INDEX IF NOT EXISTS board_order_idx ON public.board("order");
CREATE INDEX IF NOT EXISTS events_created_at_idx ON public.events(created_at DESC);
CREATE INDEX IF NOT EXISTS news_created_at_idx ON public.news(created_at DESC);
CREATE INDEX IF NOT EXISTS blog_created_at_idx ON public.blog(created_at DESC);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS files_created_at_idx ON public.files(created_at DESC);
