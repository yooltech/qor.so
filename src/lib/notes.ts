import { supabase } from "@/integrations/supabase/client";

export interface Note {
  id: string;
  content: string;
  format: "text" | "json";
  title: string | null;
  size_bytes: number;
  created_at: string;
  updated_at: string;
}

const MAX_SIZE = 1048576; // 1MB

export async function createNote(content: string, format: "text" | "json", title?: string): Promise<Note> {
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

  const { data, error } = await supabase
    .from("notes")
    .insert({ content, format, title: title || null })
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
