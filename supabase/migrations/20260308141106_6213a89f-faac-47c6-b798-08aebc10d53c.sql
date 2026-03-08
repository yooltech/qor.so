
-- Add custom slug column (unique, optional)
ALTER TABLE public.notes ADD COLUMN slug TEXT UNIQUE;

-- Create index for slug lookups
CREATE INDEX idx_notes_slug ON public.notes(slug) WHERE slug IS NOT NULL;
