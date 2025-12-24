-- Etkinlikler Tablosu - Temiz Kurulum
-- Önce varsa sil, sonra sıfırdan oluştur

DROP TABLE IF EXISTS public.events CASCADE;

CREATE TABLE public.events (
  id BIGSERIAL PRIMARY KEY,
  baslik TEXT NOT NULL,
  kategori TEXT,
  tarih TEXT,
  saat TEXT,
  konum TEXT,
  konum_lat DOUBLE PRECISION DEFAULT 0,
  konum_lng DOUBLE PRECISION DEFAULT 0,
  kapasite TEXT,
  kayitli TEXT DEFAULT '0',
  durum TEXT DEFAULT 'Açık',
  gorsel TEXT,
  ozet TEXT,
  icerik TEXT,
  slug TEXT,
  meta_baslik TEXT,
  meta_aciklama TEXT,
  yayin_durumu TEXT DEFAULT 'taslak',
  sliderda_goster BOOLEAN DEFAULT false,
  google_form_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS aktif et
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policies: Okuma herkese açık, yazma authenticated VEYA geçici bypass
CREATE POLICY read_events ON public.events FOR SELECT USING (true);
CREATE POLICY write_events ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY update_events ON public.events FOR UPDATE USING (true);
CREATE POLICY delete_events ON public.events FOR DELETE USING (true);

-- Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.events TO authenticated;

-- Indexes
CREATE INDEX events_created_at_idx ON public.events(created_at DESC);
CREATE INDEX events_yayin_durumu_idx ON public.events(yayin_durumu);
CREATE INDEX events_sliderda_goster_idx ON public.events(sliderda_goster);

-- Şema önbelleğini yenile
SELECT pg_notify('pgrst', 'reload schema');
