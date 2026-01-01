-- TÜM TABLOLARI VE VERİLERİ GÖSTER
-- Bu SQL scriptini Supabase SQL Editor'da çalıştırarak tüm verileri görebilirsiniz

-- 1. CATEGORIES (Kategoriler)
SELECT 'CATEGORIES' as tablo, COUNT(*) as kayit_sayisi FROM public.categories;
SELECT * FROM public.categories ORDER BY created_at DESC;

-- 2. BOARD (Yönetim Kurulu)
SELECT 'BOARD' as tablo, COUNT(*) as kayit_sayisi FROM public.board;
SELECT * FROM public.board ORDER BY "order", created_at DESC;

-- 3. BANK_INFO (Banka Bilgileri)
SELECT 'BANK_INFO' as tablo, COUNT(*) as kayit_sayisi FROM public.bank_info;
SELECT * FROM public.bank_info ORDER BY created_at DESC;

-- 4. EVENTS (Etkinlikler)
SELECT 'EVENTS' as tablo, COUNT(*) as kayit_sayisi FROM public.events;
SELECT * FROM public.events ORDER BY created_at DESC LIMIT 50;

-- 5. NEWS (Haberler)
SELECT 'NEWS' as tablo, COUNT(*) as kayit_sayisi FROM public.news;
SELECT * FROM public.news ORDER BY created_at DESC LIMIT 50;

-- 6. BLOG (Blog Yazıları)
SELECT 'BLOG' as tablo, COUNT(*) as kayit_sayisi FROM public.blog;
SELECT * FROM public.blog ORDER BY created_at DESC LIMIT 50;

-- 7. PROJECTS (Projeler)
SELECT 'PROJECTS' as tablo, COUNT(*) as kayit_sayisi FROM public.projects;
SELECT * FROM public.projects ORDER BY created_at DESC LIMIT 50;

-- 8. FILES (Dosyalar/Yayınlar)
SELECT 'FILES' as tablo, COUNT(*) as kayit_sayisi FROM public.files;
SELECT * FROM public.files ORDER BY created_at DESC LIMIT 50;

-- 9. SETTINGS (Ayarlar - ÖNEMLİ: Şifreler burada!)
SELECT 'SETTINGS' as tablo, COUNT(*) as kayit_sayisi FROM public.settings;
SELECT * FROM public.settings ORDER BY updated_at DESC;

-- 10. CONTACT_MESSAGES (İletişim Mesajları)
SELECT 'CONTACT_MESSAGES' as tablo, COUNT(*) as kayit_sayisi FROM public.contact_messages;
SELECT * FROM public.contact_messages ORDER BY created_at DESC LIMIT 50;

-- ÖZET: Tüm tabloların kayıt sayıları
SELECT 
    'categories' as tablo, COUNT(*) as kayit_sayisi FROM public.categories
UNION ALL
SELECT 'board', COUNT(*) FROM public.board
UNION ALL
SELECT 'bank_info', COUNT(*) FROM public.bank_info
UNION ALL
SELECT 'events', COUNT(*) FROM public.events
UNION ALL
SELECT 'news', COUNT(*) FROM public.news
UNION ALL
SELECT 'blog', COUNT(*) FROM public.blog
UNION ALL
SELECT 'projects', COUNT(*) FROM public.projects
UNION ALL
SELECT 'files', COUNT(*) FROM public.files
UNION ALL
SELECT 'settings', COUNT(*) FROM public.settings
UNION ALL
SELECT 'contact_messages', COUNT(*) FROM public.contact_messages
ORDER BY kayit_sayisi DESC;
