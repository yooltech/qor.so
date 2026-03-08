
-- Recreate the view with security_invoker to fix the security definer warning
DROP VIEW IF EXISTS public.public_stats;
CREATE VIEW public.public_stats
WITH (security_invoker = on) AS
SELECT
  (SELECT count(*) FROM public.notes WHERE (expires_at IS NULL OR expires_at > now()))::integer AS total_notes,
  (SELECT coalesce(sum(view_count), 0) FROM public.notes)::integer AS total_views,
  (SELECT coalesce(sum(size_bytes), 0) FROM public.notes)::bigint AS total_bytes,
  (SELECT count(*) FROM public.notes WHERE created_at > now() - interval '24 hours')::integer AS notes_today;
