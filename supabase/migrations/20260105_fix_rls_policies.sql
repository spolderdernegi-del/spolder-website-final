-- Fix RLS policies - implement role-based access control
-- Only users with 'admin' role can modify data

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop all existing permissive policies
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Drop all existing policies on affected tables
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN ('bank_info', 'blog', 'board', 'categories', 'events', 'files', 'news', 'projects', 'settings', 'contact_messages')
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ============================================
-- BANK_INFO TABLE
-- ============================================
CREATE POLICY "Public can view bank info"
  ON public.bank_info FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert bank info"
  ON public.bank_info FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update bank info"
  ON public.bank_info FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Only admins can delete bank info"
  ON public.bank_info FOR DELETE
  USING (public.is_admin());

-- ============================================
-- BLOG TABLE
-- ============================================
CREATE POLICY "Public can view published blogs"
  ON public.blog FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert blogs"
  ON public.blog FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update blogs"
  ON public.blog FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Only admins can delete blogs"
  ON public.blog FOR DELETE
  USING (public.is_admin());

-- ============================================
-- BOARD TABLE
-- ============================================
CREATE POLICY "Public can view board members"
  ON public.board FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert board members"
  ON public.board FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update board members"
  ON public.board FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Only admins can delete board members"
  ON public.board FOR DELETE
  USING (public.is_admin());

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE POLICY "Public can view categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update categories"
  ON public.categories FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Only admins can delete categories"
  ON public.categories FOR DELETE
  USING (public.is_admin());

-- ============================================
-- CONTACT_MESSAGES TABLE (Special case - public can insert)
-- ============================================
CREATE POLICY "Anyone can send contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can view contact messages"
  ON public.contact_messages FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Only admins can update contact messages"
  ON public.contact_messages FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Only admins can delete contact messages"
  ON public.contact_messages FOR DELETE
  USING (public.is_admin());

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE POLICY "Public can view events"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert events"
  ON public.events FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update events"
  ON public.events FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Only admins can delete events"
  ON public.events FOR DELETE
  USING (public.is_admin());

-- ============================================
-- FILES TABLE
-- ============================================
CREATE POLICY "Public can view files"
  ON public.files FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert files"
  ON public.files FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update files"
  ON public.files FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Only admins can delete files"
  ON public.files FOR DELETE
  USING (public.is_admin());

-- ============================================
-- NEWS TABLE
-- ============================================
CREATE POLICY "Public can view news"
  ON public.news FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert news"
  ON public.news FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update news"
  ON public.news FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Only admins can delete news"
  ON public.news FOR DELETE
  USING (public.is_admin());

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE POLICY "Public can view projects"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert projects"
  ON public.projects FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update projects"
  ON public.projects FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Only admins can delete projects"
  ON public.projects FOR DELETE
  USING (public.is_admin());

-- ============================================
-- SETTINGS TABLE
-- ============================================
CREATE POLICY "Public can view settings"
  ON public.settings FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert settings"
  ON public.settings FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update settings"
  ON public.settings FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Only admins can delete settings"
  ON public.settings FOR DELETE
  USING (public.is_admin());

-- Reload PostgREST schema
SELECT pg_notify('pgrst', 'reload schema');
