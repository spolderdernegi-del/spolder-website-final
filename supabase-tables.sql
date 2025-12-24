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
CREATE POLICY "Enable read access for all users" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.board FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.bank_info FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.events FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.news FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.blog FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.files FOR SELECT USING (true);

-- Public INSERT (herkes ekleyebilir)
CREATE POLICY "Enable insert for all users" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON public.board FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON public.bank_info FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON public.news FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON public.blog FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON public.files FOR INSERT WITH CHECK (true);

-- Public UPDATE (herkes güncelleyebilir)
CREATE POLICY "Enable update for all users" ON public.categories FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON public.board FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON public.bank_info FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON public.events FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON public.news FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON public.blog FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON public.files FOR UPDATE USING (true);

-- Public DELETE (herkes silebilir)
CREATE POLICY "Enable delete for all users" ON public.categories FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON public.board FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON public.bank_info FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON public.events FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON public.news FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON public.blog FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON public.projects FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON public.files FOR DELETE USING (true);

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
