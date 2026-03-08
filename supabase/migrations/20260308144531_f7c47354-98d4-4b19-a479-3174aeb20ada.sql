
-- Add encrypted flag to notes
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS is_encrypted boolean NOT NULL DEFAULT false;

-- Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- Update validate_note_size to skip encrypted content
CREATE OR REPLACE FUNCTION public.validate_note_size()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NOT COALESCE(NEW.is_encrypted, false) THEN
    IF length(NEW.content) > 1048576 THEN
      RAISE EXCEPTION 'Note content exceeds maximum size of 1MB';
    END IF;
    NEW.size_bytes = length(NEW.content);
  END IF;
  RETURN NEW;
END;
$$;

-- Create encrypted note (for logged-in users)
CREATE OR REPLACE FUNCTION public.create_encrypted_note(
  p_content text,
  p_format text DEFAULT 'text',
  p_title text DEFAULT NULL,
  p_password_hash text DEFAULT NULL,
  p_expires_at timestamptz DEFAULT NULL,
  p_slug text DEFAULT NULL
)
RETURNS SETOF public.notes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  enc_key text := 'qorso-enc-key-2026-xK9mP2vL';
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF length(p_content) > 1048576 THEN
    RAISE EXCEPTION 'Content exceeds 1MB limit';
  END IF;
  RETURN QUERY
  INSERT INTO public.notes (content, format, title, user_id, password_hash, expires_at, slug, is_encrypted, size_bytes)
  VALUES (
    encode(extensions.pgp_sym_encrypt(p_content, enc_key), 'base64'),
    p_format, p_title, auth.uid(), p_password_hash, p_expires_at, p_slug, true, length(p_content)
  )
  RETURNING *;
END;
$$;

-- Decrypt single note by ID (handles both encrypted and unencrypted)
CREATE OR REPLACE FUNCTION public.decrypt_note_content(p_note_id text)
RETURNS TABLE(
  id text, content text, format text, title text, size_bytes integer,
  created_at timestamptz, updated_at timestamptz, user_id uuid,
  password_hash text, expires_at timestamptz, view_count integer,
  slug text, is_encrypted boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  enc_key text := 'qorso-enc-key-2026-xK9mP2vL';
  r public.notes;
BEGIN
  SELECT n.* INTO r FROM public.notes n WHERE n.id = p_note_id;
  IF r IS NULL THEN RETURN; END IF;
  IF r.expires_at IS NOT NULL AND r.expires_at <= now() THEN RETURN; END IF;
  RETURN QUERY SELECT r.id,
    CASE WHEN r.is_encrypted THEN extensions.pgp_sym_decrypt(decode(r.content, 'base64'), enc_key) ELSE r.content END,
    r.format, r.title, r.size_bytes, r.created_at, r.updated_at, r.user_id,
    r.password_hash, r.expires_at, r.view_count, r.slug, r.is_encrypted;
END;
$$;

-- List user notes with decrypted content
CREATE OR REPLACE FUNCTION public.list_user_notes_decrypted()
RETURNS TABLE(
  id text, content text, format text, title text, size_bytes integer,
  created_at timestamptz, updated_at timestamptz, user_id uuid,
  password_hash text, expires_at timestamptz, view_count integer,
  slug text, is_encrypted boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  enc_key text := 'qorso-enc-key-2026-xK9mP2vL';
BEGIN
  RETURN QUERY
  SELECT n.id,
    CASE WHEN n.is_encrypted THEN extensions.pgp_sym_decrypt(decode(n.content, 'base64'), enc_key) ELSE n.content END,
    n.format, n.title, n.size_bytes, n.created_at, n.updated_at, n.user_id,
    n.password_hash, n.expires_at, n.view_count, n.slug, n.is_encrypted
  FROM public.notes n
  WHERE n.user_id = auth.uid()
  ORDER BY n.created_at DESC;
END;
$$;

-- Update encrypted note
CREATE OR REPLACE FUNCTION public.update_encrypted_note(
  p_note_id text,
  p_content text,
  p_password_hash text DEFAULT NULL,
  p_slug text DEFAULT NULL,
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  enc_key text := 'qorso-enc-key-2026-xK9mP2vL';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.notes WHERE id = p_note_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Note not found or access denied';
  END IF;
  UPDATE public.notes SET
    content = encode(extensions.pgp_sym_encrypt(p_content, enc_key), 'base64'),
    size_bytes = length(p_content),
    is_encrypted = true,
    password_hash = COALESCE(p_password_hash, password_hash),
    slug = p_slug,
    expires_at = p_expires_at
  WHERE id = p_note_id;
END;
$$;
