import { supabase } from "@/integrations/supabase/client";
import { hashPassword } from "./crypto";

export interface SharedFile {
  id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  user_id: string | null;
  slug: string | null;
  password_hash: string | null;
  expires_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

const MAX_SIZE = 52428800; // 50MB

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

export interface UploadFileOptions {
  file: File;
  password?: string;
  expiresIn?: number | null;
  slug?: string;
}

export async function uploadFile(opts: UploadFileOptions): Promise<SharedFile> {
  const { file, password, expiresIn, slug } = opts;

  if (file.size > MAX_SIZE) {
    throw new Error("File exceeds maximum size of 50MB");
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("File type not supported. Use images (JPG, PNG, GIF) or documents (PDF, DOCX, XLSX, PPTX)");
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

  // Upload to storage
  const fileExt = file.name.split('.').pop();
  const storagePath = `${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('shared-files')
    .upload(storagePath, file);

  if (uploadError) throw uploadError;

  // Create record
  const password_hash = password ? await hashPassword(password) : null;
  const expires_at = expiresIn
    ? new Date(Date.now() + expiresIn * 60 * 1000).toISOString()
    : null;

  const { data, error } = await supabase
    .from("shared_files")
    .insert({
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      storage_path: storagePath,
      user_id: user?.id || null,
      slug: slug || null,
      password_hash,
      expires_at,
    } as any)
    .select()
    .single();

  if (error) {
    // Clean up uploaded file
    await supabase.storage.from('shared-files').remove([storagePath]);
    if (error.message?.includes("duplicate") || error.code === "23505") {
      throw new Error("This slug is already taken");
    }
    throw error;
  }

  return data as unknown as SharedFile;
}

export async function getSharedFile(idOrSlug: string): Promise<SharedFile> {
  const { data: slugData } = await supabase
    .from("shared_files")
    .select("*")
    .eq("slug", idOrSlug)
    .maybeSingle();

  if (slugData) return slugData as unknown as SharedFile;

  const { data, error } = await supabase
    .from("shared_files")
    .select("*")
    .eq("id", idOrSlug)
    .single();

  if (error) throw error;
  return data as unknown as SharedFile;
}

export function getFileUrl(storagePath: string): string {
  const { data } = supabase.storage.from('shared-files').getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function deleteSharedFile(id: string, storagePath: string): Promise<void> {
  await supabase.storage.from('shared-files').remove([storagePath]);
  const { error } = await supabase.from("shared_files").delete().eq("id", id);
  if (error) throw error;
}
