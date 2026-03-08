
-- Add view_count to notes
ALTER TABLE public.notes ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;

-- Create a security definer function to increment views (bypasses RLS)
CREATE OR REPLACE FUNCTION public.increment_note_view(note_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.notes SET view_count = view_count + 1 WHERE id = note_id;
END;
$$;

-- Create a view for public stats (no sensitive data)
CREATE OR REPLACE VIEW public.public_stats AS
SELECT
  (SELECT count(*) FROM public.notes WHERE (expires_at IS NULL OR expires_at > now()))::integer AS total_notes,
  (SELECT coalesce(sum(view_count), 0) FROM public.notes)::integer AS total_views,
  (SELECT coalesce(sum(size_bytes), 0) FROM public.notes)::bigint AS total_bytes,
  (SELECT count(*) FROM public.notes WHERE created_at > now() - interval '24 hours')::integer AS notes_today;
