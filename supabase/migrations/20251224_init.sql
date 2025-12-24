-- Initial schema from supabase-tables.sql

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
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    date TEXT,
    time TEXT,
    location TEXT,
    image TEXT,
    category TEXT,
    capacity TEXT,
    registered TEXT DEFAULT '0',
    status TEXT DEFAULT 'Açık',
    publishStatus TEXT DEFAULT 'draft',
    showInSlider BOOLEAN DEFAULT false,
    slug TEXT,
    metaTitle TEXT,
    metaDescription TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- News tablosu
CREATE TABLE IF NOT EXISTS public.news (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    image TEXT,
    category TEXT,
    author TEXT,
    date TEXT,
    publishStatus TEXT DEFAULT 'draft',
    showInSlider BOOLEAN DEFAULT false,
    slug TEXT,
    metaTitle TEXT,
    metaDescription TEXT,
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
    publishStatus TEXT DEFAULT 'draft',
    showInSlider BOOLEAN DEFAULT false,
    slug TEXT,
    metaTitle TEXT,
    metaDescription TEXT,
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
    publishStatus TEXT DEFAULT 'draft',
    showInSlider BOOLEAN DEFAULT false,
    slug TEXT,
    metaTitle TEXT,
    metaDescription TEXT,
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

-- RLS (Row Level Security) Politikaları
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Public SELECT (herkes okuyabilir)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
CREATE POLICY "Enable read access for all users" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON public.board;
CREATE POLICY "Enable read access for all users" ON public.board FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON public.bank_info;
CREATE POLICY "Enable read access for all users" ON public.bank_info FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON public.events;
CREATE POLICY "Enable read access for all users" ON public.events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON public.news;
CREATE POLICY "Enable read access for all users" ON public.news FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON public.blog;
CREATE POLICY "Enable read access for all users" ON public.blog FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON public.projects;
CREATE POLICY "Enable read access for all users" ON public.projects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON public.files;
CREATE POLICY "Enable read access for all users" ON public.files FOR SELECT USING (true);

-- INSERT (authenticated users only)
DROP POLICY IF EXISTS "Enable insert for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.categories;
CREATE POLICY "Enable insert for authenticated users" ON public.categories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable insert for all users" ON public.board;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.board;
CREATE POLICY "Enable insert for authenticated users" ON public.board FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable insert for all users" ON public.bank_info;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.bank_info;
CREATE POLICY "Enable insert for authenticated users" ON public.bank_info FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable insert for all users" ON public.events;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.events;
CREATE POLICY "Enable insert for authenticated users" ON public.events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable insert for all users" ON public.news;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.news;
CREATE POLICY "Enable insert for authenticated users" ON public.news FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable insert for all users" ON public.blog;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.blog;
CREATE POLICY "Enable insert for authenticated users" ON public.blog FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable insert for all users" ON public.projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.projects;
CREATE POLICY "Enable insert for authenticated users" ON public.projects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable insert for all users" ON public.files;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.files;
CREATE POLICY "Enable insert for authenticated users" ON public.files FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE (authenticated users only)
DROP POLICY IF EXISTS "Enable update for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.categories;
CREATE POLICY "Enable update for authenticated users" ON public.categories FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable update for all users" ON public.board;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.board;
CREATE POLICY "Enable update for authenticated users" ON public.board FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable update for all users" ON public.bank_info;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.bank_info;
CREATE POLICY "Enable update for authenticated users" ON public.bank_info FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable update for all users" ON public.events;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.events;
CREATE POLICY "Enable update for authenticated users" ON public.events FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable update for all users" ON public.news;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.news;
CREATE POLICY "Enable update for authenticated users" ON public.news FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable update for all users" ON public.blog;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.blog;
CREATE POLICY "Enable update for authenticated users" ON public.blog FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable update for all users" ON public.projects;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.projects;
CREATE POLICY "Enable update for authenticated users" ON public.projects FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable update for all users" ON public.files;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.files;
CREATE POLICY "Enable update for authenticated users" ON public.files FOR UPDATE USING (auth.uid() IS NOT NULL);

-- DELETE (authenticated users only)
DROP POLICY IF EXISTS "Enable delete for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.categories;
CREATE POLICY "Enable delete for authenticated users" ON public.categories FOR DELETE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable delete for all users" ON public.board;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.board;
CREATE POLICY "Enable delete for authenticated users" ON public.board FOR DELETE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable delete for all users" ON public.bank_info;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.bank_info;
CREATE POLICY "Enable delete for authenticated users" ON public.bank_info FOR DELETE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable delete for all users" ON public.events;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.events;
CREATE POLICY "Enable delete for authenticated users" ON public.events FOR DELETE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable delete for all users" ON public.news;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.news;
CREATE POLICY "Enable delete for authenticated users" ON public.news FOR DELETE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable delete for all users" ON public.blog;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.blog;
CREATE POLICY "Enable delete for authenticated users" ON public.blog FOR DELETE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable delete for all users" ON public.projects;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.projects;
CREATE POLICY "Enable delete for authenticated users" ON public.projects FOR DELETE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable delete for all users" ON public.files;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.files;
CREATE POLICY "Enable delete for authenticated users" ON public.files FOR DELETE USING (auth.uid() IS NOT NULL);

-- Settings tablosu (basit key/value)
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.settings;
CREATE POLICY "Enable read access for all users" ON public.settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for all users" ON public.settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.settings;
CREATE POLICY "Enable insert for authenticated users" ON public.settings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable update for all users" ON public.settings;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.settings;
CREATE POLICY "Enable update for authenticated users" ON public.settings FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable delete for all users" ON public.settings;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.settings;
CREATE POLICY "Enable delete for authenticated users" ON public.settings FOR DELETE USING (auth.uid() IS NOT NULL);

-- Şema hizalama ve indexler vb. (kısaltıldı)
CREATE INDEX IF NOT EXISTS categories_type_idx ON public.categories(type);
CREATE INDEX IF NOT EXISTS board_order_idx ON public.board("order");
CREATE INDEX IF NOT EXISTS events_created_at_idx ON public.events(created_at DESC);
CREATE INDEX IF NOT EXISTS events_publishStatus_idx ON public.events(publishStatus);
CREATE INDEX IF NOT EXISTS events_showInSlider_idx ON public.events(showInSlider);
CREATE INDEX IF NOT EXISTS news_created_at_idx ON public.news(created_at DESC);
CREATE INDEX IF NOT EXISTS news_publishStatus_idx ON public.news(publishStatus);
CREATE INDEX IF NOT EXISTS blog_created_at_idx ON public.blog(created_at DESC);
CREATE INDEX IF NOT EXISTS blog_publishStatus_idx ON public.blog(publishStatus);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS projects_publishStatus_idx ON public.projects(publishStatus);
CREATE INDEX IF NOT EXISTS files_created_at_idx ON public.files(created_at DESC);-- Initial schema from supabase-tables.sql

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
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    date TEXT,
    time TEXT,
    location TEXT,
    image TEXT,
    category TEXT,
    capacity TEXT,
    registered TEXT DEFAULT '0',
    status TEXT DEFAULT 'Açık',
    publishStatus TEXT DEFAULT 'draft',
    showInSlider BOOLEAN DEFAULT false,
    slug TEXT,
    metaTitle TEXT,
    metaDescription TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- News tablosu
CREATE TABLE IF NOT EXISTS public.news (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    image TEXT,
    category TEXT,
    author TEXT,
    date TEXT,
    publishStatus TEXT DEFAULT 'draft',
    showInSlider BOOLEAN DEFAULT false,
    slug TEXT,
    metaTitle TEXT,
    metaDescription TEXT,
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
    publishStatus TEXT DEFAULT 'draft',
    showInSlider BOOLEAN DEFAULT false,
    slug TEXT,
    metaTitle TEXT,
    metaDescription TEXT,
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
    publishStatus TEXT DEFAULT 'draft',
    showInSlider BOOLEAN DEFAULT false,
    slug TEXT,
    metaTitle TEXT,
    metaDescription TEXT,
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

-- RLS (Row Level Security) Politikaları
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Public SELECT (herkes okuyabilir)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
CREATE POLICY "Enable read access for all users" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON public.board;
CREATE POLICY "Enable read access for all users" ON public.board FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON public.bank_info;
CREATE POLICY "Enable read access for all users" ON public.bank_info FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON public.events;
CREATE POLICY "Enable read access for all users" ON public.events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON public.news;
CREATE POLICY "Enable read access for all users" ON public.news FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON public.blog;
CREATE POLICY "Enable read access for all users" ON public.blog FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON public.projects;
CREATE POLICY "Enable read access for all users" ON public.projects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON public.files;
CREATE POLICY "Enable read access for all users" ON public.files FOR SELECT USING (true);

-- INSERT (authenticated users only)
DROP POLICY IF EXISTS "Enable insert for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.categories;
CREATE POLICY "Enable insert for authenticated users" ON public.categories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable insert for all users" ON public.board;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.board;
CREATE POLICY "Enable insert for authenticated users" ON public.board FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable insert for all users" ON public.bank_info;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.bank_info;
CREATE POLICY "Enable insert for authenticated users" ON public.bank_info FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable insert for all users" ON public.events;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.events;
CREATE POLICY "Enable insert for authenticated users" ON public.events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable insert for all users" ON public.news;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.news;
CREATE POLICY "Enable insert for authenticated users" ON public.news FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable insert for all users" ON public.blog;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.blog;
CREATE POLICY "Enable insert for authenticated users" ON public.blog FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable insert for all users" ON public.projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.projects;
CREATE POLICY "Enable insert for authenticated users" ON public.projects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable insert for all users" ON public.files;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.files;
CREATE POLICY "Enable insert for authenticated users" ON public.files FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE (authenticated users only)
DROP POLICY IF EXISTS "Enable update for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.categories;
CREATE POLICY "Enable update for authenticated users" ON public.categories FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable update for all users" ON public.board;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.board;
CREATE POLICY "Enable update for authenticated users" ON public.board FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable update for all users" ON public.bank_info;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.bank_info;
CREATE POLICY "Enable update for authenticated users" ON public.bank_info FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable update for all users" ON public.events;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.events;
CREATE POLICY "Enable update for authenticated users" ON public.events FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable update for all users" ON public.news;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.news;
CREATE POLICY "Enable update for authenticated users" ON public.news FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable update for all users" ON public.blog;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.blog;
CREATE POLICY "Enable update for authenticated users" ON public.blog FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable update for all users" ON public.projects;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.projects;
CREATE POLICY "Enable update for authenticated users" ON public.projects FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable update for all users" ON public.files;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.files;
CREATE POLICY "Enable update for authenticated users" ON public.files FOR UPDATE USING (auth.uid() IS NOT NULL);

-- DELETE (authenticated users only)
DROP POLICY IF EXISTS "Enable delete for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.categories;
CREATE POLICY "Enable delete for authenticated users" ON public.categories FOR DELETE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable delete for all users" ON public.board;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.board;
CREATE POLICY "Enable delete for authenticated users" ON public.board FOR DELETE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable delete for all users" ON public.bank_info;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.bank_info;
CREATE POLICY "Enable delete for authenticated users" ON public.bank_info FOR DELETE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable delete for all users" ON public.events;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.events;
CREATE POLICY "Enable delete for authenticated users" ON public.events FOR DELETE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable delete for all users" ON public.news;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.news;
CREATE POLICY "Enable delete for authenticated users" ON public.news FOR DELETE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable delete for all users" ON public.blog;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.blog;
CREATE POLICY "Enable delete for authenticated users" ON public.blog FOR DELETE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable delete for all users" ON public.projects;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.projects;
CREATE POLICY "Enable delete for authenticated users" ON public.projects FOR DELETE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable delete for all users" ON public.files;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.files;
CREATE POLICY "Enable delete for authenticated users" ON public.files FOR DELETE USING (auth.uid() IS NOT NULL);

-- Settings tablosu (basit key/value)
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.settings;
CREATE POLICY "Enable read access for all users" ON public.settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for all users" ON public.settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.settings;
CREATE POLICY "Enable insert for authenticated users" ON public.settings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable update for all users" ON public.settings;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.settings;
CREATE POLICY "Enable update for authenticated users" ON public.settings FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Enable delete for all users" ON public.settings;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.settings;
CREATE POLICY "Enable delete for authenticated users" ON public.settings FOR DELETE USING (auth.uid() IS NOT NULL);

-- Şema hizalama: eksik kolonları güvenli şekilde ekle (IF NOT EXISTS)
-- Events: uygulama full_content ve publishStatus/showInSlider alanlarını bekliyor
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS full_content TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS publishStatus TEXT DEFAULT 'draft';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS showInSlider BOOLEAN DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS metaTitle TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS metaDescription TEXT;

-- Mevcut content alanı varsa ve full_content boş ise, içeriği taşı
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'content'
    ) THEN
        EXECUTE 'UPDATE public.events SET full_content = content WHERE full_content IS NULL AND content IS NOT NULL';
    END IF;
END $$;

-- News: publishStatus/showInSlider/SEO alanlarını garanti altına al
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS publishStatus TEXT DEFAULT 'draft';
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS showInSlider BOOLEAN DEFAULT false;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS metaTitle TEXT;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS metaDescription TEXT;

-- Blog: publishStatus/showInSlider/SEO alanları
ALTER TABLE public.blog ADD COLUMN IF NOT EXISTS publishStatus TEXT DEFAULT 'draft';
ALTER TABLE public.blog ADD COLUMN IF NOT EXISTS showInSlider BOOLEAN DEFAULT false;
ALTER TABLE public.blog ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.blog ADD COLUMN IF NOT EXISTS metaTitle TEXT;
ALTER TABLE public.blog ADD COLUMN IF NOT EXISTS metaDescription TEXT;

-- Projects: publishStatus/showInSlider/SEO alanları
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS publishStatus TEXT DEFAULT 'draft';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS showInSlider BOOLEAN DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS metaTitle TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS metaDescription TEXT;

-- Indexes (performans için)
CREATE INDEX IF NOT EXISTS categories_type_idx ON public.categories(type);
CREATE INDEX IF NOT EXISTS board_order_idx ON public.board("order");
CREATE INDEX IF NOT EXISTS events_created_at_idx ON public.events(created_at DESC);
CREATE INDEX IF NOT EXISTS events_publishStatus_idx ON public.events(publishStatus);
CREATE INDEX IF NOT EXISTS events_showInSlider_idx ON public.events(showInSlider);
CREATE INDEX IF NOT EXISTS news_created_at_idx ON public.news(created_at DESC);
CREATE INDEX IF NOT EXISTS news_publishStatus_idx ON public.news(publishStatus);
CREATE INDEX IF NOT EXISTS blog_created_at_idx ON public.blog(created_at DESC);
CREATE INDEX IF NOT EXISTS blog_publishStatus_idx ON public.blog(publishStatus);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS projects_publishStatus_idx ON public.projects(publishStatus);
CREATE INDEX IF NOT EXISTS files_created_at_idx ON public.files(created_at DESC);
