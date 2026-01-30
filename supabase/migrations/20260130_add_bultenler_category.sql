-- Add "Bültenler" (Bulletins) category for files
-- This is a fixed category that cannot be edited or deleted in the frontend

INSERT INTO public.categories (name, type, color, created_at, updated_at)
VALUES 
    ('Bültenler', 'files', '#F59E0B', NOW(), NOW())
ON CONFLICT DO NOTHING;
