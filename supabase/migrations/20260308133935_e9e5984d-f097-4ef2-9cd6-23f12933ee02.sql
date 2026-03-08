-- Create notes table for public sharing
CREATE TABLE public.notes (
  id TEXT NOT NULL PRIMARY KEY DEFAULT encode(gen_random_bytes(6), 'hex'),
  content TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'text' CHECK (format IN ('text', 'json')),
  title TEXT,
  size_bytes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view notes" ON public.notes FOR SELECT USING (true);

-- Public insert access
CREATE POLICY "Anyone can create notes" ON public.notes FOR INSERT WITH CHECK (true);

-- Public delete
CREATE POLICY "Anyone can delete notes" ON public.notes FOR DELETE USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Validate content size (max 1MB)
CREATE OR REPLACE FUNCTION public.validate_note_size()
RETURNS TRIGGER AS $$
BEGIN
  IF length(NEW.content) > 1048576 THEN
    RAISE EXCEPTION 'Note content exceeds maximum size of 1MB';
  END IF;
  NEW.size_bytes = length(NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_note_size_trigger
BEFORE INSERT OR UPDATE ON public.notes
FOR EACH ROW EXECUTE FUNCTION public.validate_note_size();