-- GÜVENLİK DÜZELTMESİ: RLS Politikalarını Authenticated-Only Yap
-- Bu script tüm tabloları sadece authenticated kullanıcılara açar
-- Public kullanıcılar sadece READ yapabilir (INSERT/UPDATE/DELETE yapamaz)

-- Mevcut güvensiz politikaları kaldır
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

-- GÜVENLİ POLİTİKALAR: Sadece authenticated kullanıcılar yazabilir

-- INSERT: Sadece authenticated
CREATE POLICY "Authenticated users can insert" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert" ON public.board FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert" ON public.bank_info FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert" ON public.events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert" ON public.news FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert" ON public.blog FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert" ON public.projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert" ON public.files FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert" ON public.settings FOR INSERT TO authenticated WITH CHECK (true);

-- UPDATE: Sadece authenticated
CREATE POLICY "Authenticated users can update" ON public.categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update" ON public.board FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update" ON public.bank_info FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update" ON public.events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update" ON public.news FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update" ON public.blog FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update" ON public.projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update" ON public.files FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update" ON public.settings FOR UPDATE TO authenticated USING (true);

-- DELETE: Sadece authenticated
CREATE POLICY "Authenticated users can delete" ON public.categories FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete" ON public.board FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete" ON public.bank_info FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete" ON public.events FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete" ON public.news FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete" ON public.blog FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete" ON public.projects FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete" ON public.files FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete" ON public.settings FOR DELETE TO authenticated USING (true);

-- Schema cache'i yenile
SELECT pg_notify('pgrst', 'reload schema');
