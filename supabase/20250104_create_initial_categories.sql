-- Insert initial categories for Events, News, and Blog
-- Run this in Supabase SQL Editor to populate categories

-- Events Categories
INSERT INTO categories (name, type, color) VALUES 
('Konferans', 'events', '#3B82F6'),
('Forum', 'events', '#8B5CF6'),
('Atölye', 'events', '#EC4899'),
('Seminer', 'events', '#F59E0B'),
('Toplantı', 'events', '#10B981')
ON CONFLICT DO NOTHING;

-- News Categories  
INSERT INTO categories (name, type, color) VALUES 
('Haber', 'news', '#EF4444'),
('Duyuru', 'news', '#F59E0B'),
('Güncelleme', 'news', '#3B82F6'),
('Basın', 'news', '#8B5CF6')
ON CONFLICT DO NOTHING;

-- Blog Categories
INSERT INTO categories (name, type, color) VALUES 
('Analiz', 'blog', '#10B981'),
('Görüş', 'blog', '#F59E0B'),
('Rehber', 'blog', '#3B82F6')
ON CONFLICT DO NOTHING;

-- Files Categories (for Yayınlar - These are FIXED and cannot be edited/deleted)
INSERT INTO categories (name, type, color) VALUES 
('Rapor', 'files', '#6366F1'),
('Araştırma', 'files', '#8B5CF6'),
('Politika Belgesi', 'files', '#EC4899')
ON CONFLICT DO NOTHING;

-- Verify insertion
SELECT type, COUNT(*) as count FROM categories GROUP BY type;
