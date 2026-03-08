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
}

const MAX_SIZE = 1048576; // 1MB

export interface CreateNoteOptions {
  content: string;
  format: "text" | "json";
  title?: string;
  password?: string;
  expiresIn?: number | null; // minutes
}

export async function createNote(opts: CreateNoteOptions): Promise<Note> {
  const { content, format, title, password, expiresIn } = opts;

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

  const { data: { user } } = await supabase.auth.getUser();

  const password_hash = password ? await hashPassword(password) : null;
  const expires_at = expiresIn
    ? new Date(Date.now() + expiresIn * 60 * 1000).toISOString()
    : null;

  const { data, error } = await supabase
    .from("notes")
    .insert({
      content,
      format,
      title: title || null,
      user_id: user?.id || null,
      password_hash,
      expires_at,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Note;
}

export async function getNote(id: string): Promise<Note> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Note;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw error;
}
