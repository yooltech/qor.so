
-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Only admins can view user_roles
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete any note
DROP POLICY IF EXISTS "Owner or anonymous can delete notes" ON public.notes;
CREATE POLICY "Owner admin or anonymous can delete notes" ON public.notes
  FOR DELETE USING (
    user_id IS NULL
    OR auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
  );

-- Add avatar_url default and make display_name editable
-- (profiles table already exists with these columns)

-- Add slug min length check via trigger
CREATE OR REPLACE FUNCTION public.validate_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NOT NULL AND length(NEW.slug) < 3 THEN
    RAISE EXCEPTION 'Slug must be at least 3 characters';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_note_slug
  BEFORE INSERT OR UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.validate_slug();
