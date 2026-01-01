-- İletişim Mesajları Tablosu - Temiz Kurulum
-- Önce varsa sil, sonra sıfırdan oluştur

DROP TABLE IF EXISTS public.contact_messages CASCADE;

CREATE TABLE public.contact_messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS aktif et
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policies: Okuma authenticated, ekleme public (form) için true
CREATE POLICY insert_contact_messages ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY read_contact_messages ON public.contact_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY delete_contact_messages ON public.contact_messages FOR DELETE USING (auth.role() = 'authenticated');

-- Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON TABLE public.contact_messages TO anon;
GRANT SELECT, DELETE ON TABLE public.contact_messages TO authenticated;

-- Indexes
CREATE INDEX contact_messages_created_at_idx ON public.contact_messages(created_at DESC);

-- Şema önbelleğini yenile
SELECT pg_notify('pgrst', 'reload schema');
