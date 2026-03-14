import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSharedFile, getFileUrl, deleteSharedFile } from "@/lib/files";
import { verifyPassword } from "@/lib/crypto";
import { supabase } from "@/integrations/supabase/client";
import ThemeToggle from "@/components/ThemeToggle";
import { FileText, Loader2, Lock, Clock, Download, Copy, Check, Trash2, Image, Eye } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const FileView = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: file, isLoading, error } = useQuery({
    queryKey: ["shared-file", idOrSlug],
    queryFn: () => getSharedFile(idOrSlug!),
    enabled: !!idOrSlug,
  });

  useEffect(() => {
    if (file && !viewTracked) {
      supabase.rpc("increment_file_view" as any, { file_id: file.id }).then(() => {
        setViewTracked(true);
      });
    }
  }, [file, viewTracked]);

  const isPasswordProtected = file?.password_hash && !unlocked;
  const isExpired = file?.expires_at && new Date(file.expires_at) <= new Date();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file?.password_hash) return;
    setVerifying(true);
    const valid = await verifyPassword(passwordInput, file.password_hash);
    if (valid) setUnlocked(true);
    else toast.error("Incorrect password");
    setVerifying(false);
  };

  const fileUrl = file ? getFileUrl(file.storage_path) : "";
  const isImage = file?.mime_type.startsWith("image/");

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = file?.file_name || "download";
    a.target = "_blank";
    a.click();
    toast.success("Downloading!");
  };

  const handleDelete = async () => {
    if (!file || !confirm("Delete this file permanently?")) return;
    setDeleting(true);
    try {
      await deleteSharedFile(file.id, file.storage_path);
      toast.success("File deleted");
      navigate("/");
    } catch {
      toast.error("Failed to delete file");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">qor.so</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              + New
            </Link>
          </div>
        </div>
      </nav>

      <div className="px-6 py-12">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="text-center py-20 animate-fade-in">
            <p className="text-xl font-semibold text-foreground">File not found</p>
            <p className="mt-2 text-muted-foreground">This file may have been deleted, expired, or the link is invalid.</p>
            <Link to="/" className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all">
              Go Home
            </Link>
          </div>
        )}

        {file && isExpired && (
          <div className="text-center py-20 animate-fade-in">
            <Clock className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-foreground">File Expired</p>
            <p className="mt-2 text-muted-foreground">This file expired on {new Date(file.expires_at!).toLocaleString()}.</p>
            <Link to="/" className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all">
              Go Home
            </Link>
          </div>
        )}

        {file && !isExpired && isPasswordProtected && (
          <div className="max-w-md mx-auto text-center py-20 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-6">
              <Lock className="w-7 h-7 text-accent-foreground" />
            </div>
            <p className="text-xl font-semibold text-foreground">This file is protected</p>
            <p className="mt-2 text-muted-foreground text-sm">Enter the password to access this file.</p>
            <form onSubmit={handleUnlock} className="mt-6 flex gap-2 max-w-xs mx-auto">
              <input
                type="password"
                placeholder="Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                autoFocus
              />
              <button
                type="submit"
                disabled={verifying || !passwordInput}
                className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 disabled:opacity-50"
              >
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Unlock"}
              </button>
            </form>
          </div>
        )}

        {file && !isExpired && !isPasswordProtected && (
          <div className="w-full max-w-4xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  {isImage ? <Image className="w-5 h-5 text-accent-foreground" /> : <FileText className="w-5 h-5 text-accent-foreground" />}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{file.file_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatSize(file.file_size)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {file.view_count}</span>
                    {file.expires_at && (
                      <>
                        <span>·</span>
                        <span>Expires {new Date(file.expires_at).toLocaleString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyLink}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden sm:inline">Link</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-xl border bg-card overflow-hidden">
              {isImage ? (
                <img src={fileUrl} alt={file.file_name} className="w-full max-h-[600px] object-contain bg-muted" />
              ) : file.mime_type === "application/pdf" ? (
                <iframe src={fileUrl} className="w-full h-[600px]" title={file.file_name} />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-foreground font-medium">{file.file_name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{formatSize(file.file_size)}</p>
                  <button
                    onClick={handleDownload}
                    className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </button>
                </div>
              )}
            </div>

            <p className="mt-4 text-xs text-muted-foreground text-center font-mono">
              Uploaded {new Date(file.created_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileView;
