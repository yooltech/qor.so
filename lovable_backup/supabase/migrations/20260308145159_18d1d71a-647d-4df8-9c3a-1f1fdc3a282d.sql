
-- Create public storage bucket for shared files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'shared-files',
  'shared-files',
  true,
  52428800,
  ARRAY['image/jpeg','image/png','image/gif','image/webp','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation']
) ON CONFLICT (id) DO NOTHING;

-- Create shared_files table
CREATE TABLE IF NOT EXISTS public.shared_files (
  id text NOT NULL DEFAULT encode(extensions.gen_random_bytes(6), 'hex') PRIMARY KEY,
  file_name text NOT NULL,
  file_size integer NOT NULL DEFAULT 0,
  mime_type text NOT NULL,
  storage_path text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  slug text UNIQUE,
  password_hash text,
  expires_at timestamptz,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_files ENABLE ROW LEVEL SECURITY;

-- Anyone can view non-expired files
CREATE POLICY "Anyone can view non-expired files" ON public.shared_files
  FOR SELECT USING (expires_at IS NULL OR expires_at > now());

-- Anyone can upload files
CREATE POLICY "Anyone can upload files" ON public.shared_files
  FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Owners can update their files
CREATE POLICY "Owners can update files" ON public.shared_files
  FOR UPDATE USING (auth.uid() = user_id);

-- Owners and admins can delete files
CREATE POLICY "Owners can delete files" ON public.shared_files
  FOR DELETE USING (user_id IS NULL OR auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Storage policies for the bucket
CREATE POLICY "Anyone can upload to shared-files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'shared-files');

CREATE POLICY "Anyone can view shared files" ON storage.objects
  FOR SELECT USING (bucket_id = 'shared-files');

CREATE POLICY "Owners can delete shared files" ON storage.objects
  FOR DELETE USING (bucket_id = 'shared-files');

-- Increment view count function
CREATE OR REPLACE FUNCTION public.increment_file_view(file_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.shared_files SET view_count = view_count + 1 WHERE id = file_id;
END;
$$;

-- Updated_at trigger
CREATE TRIGGER update_shared_files_updated_at
  BEFORE UPDATE ON public.shared_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
