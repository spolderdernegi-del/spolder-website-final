-- Contact messages tablosuna is_read kolonu ekle

ALTER TABLE public.contact_messages 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Update policy ekle
CREATE POLICY IF NOT EXISTS update_contact_messages 
ON public.contact_messages 
FOR UPDATE 
USING (auth.role() = 'authenticated');

GRANT UPDATE ON TABLE public.contact_messages TO authenticated;

-- Index ekle
CREATE INDEX IF NOT EXISTS contact_messages_is_read_idx ON public.contact_messages(is_read);
