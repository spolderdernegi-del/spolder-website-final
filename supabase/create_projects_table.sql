-- Projeler Tablosu - Temiz Kurulum
-- Önce varsa sil, sonra sıfırdan oluştur

DROP TABLE IF EXISTS public.projects CASCADE;

CREATE TABLE public.projects (
  id BIGSERIAL PRIMARY KEY,
  baslik TEXT NOT NULL,
  kategori TEXT,
  tarih TEXT,
  durum TEXT,
  gorsel TEXT,
  ozet TEXT,
  icerik TEXT,
  slug TEXT,
  meta_baslik TEXT,
  meta_aciklama TEXT,
  yayin_durumu TEXT DEFAULT 'taslak',
  sliderda_goster BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS aktif et
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policies: Okuma herkese açık, yazma authenticated VEYA geçici bypass
CREATE POLICY read_projects ON public.projects FOR SELECT USING (true);
CREATE POLICY write_projects ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY update_projects ON public.projects FOR UPDATE USING (true);
CREATE POLICY delete_projects ON public.projects FOR DELETE USING (true);

-- Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.projects TO authenticated;

-- Indexes
CREATE INDEX projects_created_at_idx ON public.projects(created_at DESC);
CREATE INDEX projects_yayin_durumu_idx ON public.projects(yayin_durumu);
CREATE INDEX projects_sliderda_goster_idx ON public.projects(sliderda_goster);

-- Şema önbelleğini yenile
SELECT pg_notify('pgrst', 'reload schema');
