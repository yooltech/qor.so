import { supabase } from "@/integrations/supabase/client";
import { hashPassword } from "./crypto";

export interface Note {
  id: string;
  content: string;
  format: "text" | "json";
  title: string | null;
  size_bytes: number;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  password_hash: string | null;
  expires_at: string | null;
  view_count: number;
  slug: string | null;
  is_encrypted: boolean;
}

const MAX_SIZE = 1048576; // 1MB

export interface CreateNoteOptions {
  content: string;
  format: "text" | "json";
  title?: string;
  password?: string;
  expiresIn?: number | null;
  slug?: string;
}

export async function createNote(opts: CreateNoteOptions): Promise<Note> {
  const { content, format, title, password, expiresIn, slug } = opts;

  if (content.length > MAX_SIZE) {
    throw new Error("Note content exceeds maximum size of 1MB");
  }
  if (!content.trim()) {
    throw new Error("Note content cannot be empty");
  }
  if (format === "json") {
    try {
      JSON.parse(content);
    } catch {
      throw new Error("Invalid JSON content");
    }
  }
  if (slug && slug.length < 3) {
    throw new Error("Slug must be at least 3 characters");
  }
  if (slug && !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug)) {
    throw new Error("Slug can only contain lowercase letters, numbers, and hyphens");
  }
  if (slug && ["auth", "dashboard", "analytics", "forgot-password", "reset-password", "admin", "profile"].includes(slug)) {
    throw new Error("This slug is reserved");
  }

  const { data: { user } } = await supabase.auth.getUser();

  const password_hash = password ? await hashPassword(password) : null;
  const expires_at = expiresIn
    ? new Date(Date.now() + expiresIn * 60 * 1000).toISOString()
    : null;

  if (user) {
    // Logged-in: create encrypted note via RPC
    const { data, error } = await supabase.rpc('create_encrypted_note' as any, {
      p_content: content,
      p_format: format,
      p_title: title || null,
      p_password_hash: password_hash,
      p_expires_at: expires_at,
      p_slug: slug || null,
    });

    if (error) {
      if (error.message?.includes("duplicate") || error.code === "23505") {
        throw new Error("This slug is already taken");
      }
      throw error;
    }
    const result = Array.isArray(data) ? data[0] : data;
    return result as Note;
  }

  // Anonymous: unencrypted insert
  const { data, error } = await supabase
    .from("notes")
    .insert({
      content,
      format,
      title: title || null,
      user_id: null,
      password_hash,
      expires_at,
      slug: slug || null,
    })
    .select()
    .single();

  if (error) {
    if (error.message?.includes("duplicate") || error.code === "23505") {
      throw new Error("This slug is already taken");
    }
    throw error;
  }
  return data as Note;
}

export async function getNote(idOrSlug: string): Promise<Note> {
  // Try by slug first to get the ID
  const { data: slugData } = await supabase
    .from("notes")
    .select("id")
    .eq("slug", idOrSlug)
    .maybeSingle();

  const noteId = slugData?.id || idOrSlug;

  // Use decrypt RPC which handles both encrypted and unencrypted
  const { data, error } = await supabase.rpc('decrypt_note_content' as any, { p_note_id: noteId });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  if (!result) throw new Error('Note not found');
  return result as Note;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw error;
}
