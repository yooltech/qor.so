
-- Add password protection and expiration columns
ALTER TABLE public.notes ADD COLUMN password_hash TEXT;
ALTER TABLE public.notes ADD COLUMN expires_at TIMESTAMPTZ;

-- Update SELECT policy: deny access to expired notes
DROP POLICY "Anyone can view notes" ON public.notes;
CREATE POLICY "Anyone can view non-expired notes" ON public.notes
  FOR SELECT USING (expires_at IS NULL OR expires_at > now());
