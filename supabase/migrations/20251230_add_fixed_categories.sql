-- Yayınlar için sabit kategorileri ekle
-- Bu kategoriler frontend'de korumalı ve silinemez/düzenlenemez

INSERT INTO public.categories (name, type, color, created_at, updated_at)
VALUES 
    ('Rapor', 'files', '#3B82F6', NOW(), NOW()),
    ('Araştırma', 'files', '#10B981', NOW(), NOW()),
    ('Politika Belgesi', 'files', '#8B5CF6', NOW(), NOW())
ON CONFLICT DO NOTHING;
