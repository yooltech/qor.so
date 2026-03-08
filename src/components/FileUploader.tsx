import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { uploadFile } from "@/lib/files";
import { toast } from "sonner";
import { Upload, Loader2, Lock, Clock, Link2, FileIcon, X, Image, FileText } from "lucide-react";

const EXPIRY_OPTIONS = [
  { label: "Never", value: null },
  { label: "10 min", value: 10 },
  { label: "1 hour", value: 60 },
  { label: "24 hours", value: 1440 },
  { label: "7 days", value: 10080 },
  { label: "30 days", value: 43200 },
];

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const FileUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [password, setPassword] = useState("");
  const [slug, setSlug] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFile = (f: File) => {
    if (f.size > 52428800) {
      toast.error("File exceeds 50MB limit");
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadFile({
        file,
        password: password || undefined,
        expiresIn,
        slug: slug || undefined,
      });
      toast.success("File uploaded!");
      navigate(`/file/${result.slug || result.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const isImage = file?.type.startsWith("image/");

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer ${
          dragOver
            ? "border-primary bg-primary/5"
            : file
            ? "border-border bg-card"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/30"
        } ${file ? "p-4" : "p-12"}`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/gif,image/webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {!file ? (
          <div className="text-center">
            <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-foreground font-medium">
              Drop a file here or click to browse
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Images (JPG, PNG, GIF) & Documents (PDF, DOCX, XLSX, PPTX) · Max 50MB
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
              {isImage ? <Image className="w-6 h-6 text-accent-foreground" /> : <FileText className="w-6 h-6 text-accent-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {file && (
        <>
          {/* Options toggle */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                showOptions || password || expiresIn || slug
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Options
            </button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              {slug && (
                <span className="flex items-center gap-1 px-2 py-1 rounded bg-accent text-accent-foreground">
                  <Link2 className="w-3 h-3" /> /file/{slug}
                </span>
              )}
              {password && (
                <span className="flex items-center gap-1 px-2 py-1 rounded bg-accent text-accent-foreground">
                  <Lock className="w-3 h-3" /> Protected
                </span>
              )}
              {expiresIn && (
                <span className="flex items-center gap-1 px-2 py-1 rounded bg-accent text-accent-foreground">
                  <Clock className="w-3 h-3" /> {EXPIRY_OPTIONS.find((o) => o.value === expiresIn)?.label}
                </span>
              )}
            </div>
          </div>

          {/* Options panel */}
          {showOptions && (
            <div className="mt-3 rounded-xl border bg-card p-4 space-y-4 animate-fade-in">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Link2 className="w-3.5 h-3.5" />
                  Custom URL Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-mono">/file/</span>
                  <input
                    type="text"
                    placeholder="my-file"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="flex-1 px-3 py-2 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Lock className="w-3.5 h-3.5" />
                  Password Protection
                </label>
                <input
                  type="password"
                  placeholder="Leave empty for no password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  Expiration
                </label>
                <div className="flex flex-wrap gap-2">
                  {EXPIRY_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setExpiresIn(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        expiresIn === opt.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Upload button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Upload & Share
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FileUploader;
