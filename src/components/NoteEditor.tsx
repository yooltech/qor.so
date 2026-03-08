import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNote } from "@/lib/notes";
import { toast } from "sonner";
import { FileText, Braces, Save, Loader2, Lock, Clock, Link2 } from "lucide-react";

const EXPIRY_OPTIONS = [
  { label: "Never", value: null },
  { label: "10 min", value: 10 },
  { label: "1 hour", value: 60 },
  { label: "24 hours", value: 1440 },
  { label: "7 days", value: 10080 },
  { label: "30 days", value: 43200 },
];

export interface NoteEditOptions {
  content: string;
  format: "text" | "json";
  password?: string;
  slug?: string;
  expiresIn?: number | null;
}

interface NoteEditorProps {
  initialContent?: string;
  initialFormat?: "text" | "json";
  initialSlug?: string;
  initialHasPassword?: boolean;
  initialExpiresAt?: string | null;
  mode?: "create" | "edit";
  onSave?: (opts: NoteEditOptions) => void;
  onCancel?: () => void;
  saving?: boolean;
}

const NoteEditor = ({
  initialContent = "",
  initialFormat = "text",
  mode = "create",
  onSave,
  onCancel,
  saving: externalSaving,
}: NoteEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [format, setFormat] = useState<"text" | "json">(initialFormat);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [slug, setSlug] = useState("");
  const [showProtection, setShowProtection] = useState(false);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const navigate = useNavigate();

  const lineCount = content.split("\n").length;
  const isSaving = externalSaving || saving;

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Please enter some content");
      return;
    }

    if (mode === "edit" && onSave) {
      onSave(content, format);
      return;
    }

    setSaving(true);
    try {
      const note = await createNote({
        content,
        format,
        password: password || undefined,
        expiresIn,
        slug: slug || undefined,
      });
      toast.success("Note saved!");
      navigate(`/${note.slug || note.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
          <button
            onClick={() => setFormat("text")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              format === "text"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4" />
            Text
          </button>
          <button
            onClick={() => setFormat("json")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              format === "json"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Braces className="w-4 h-4" />
            JSON
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowProtection(!showProtection)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              showProtection || password || expiresIn || slug
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Options
          </button>
          <span className="text-xs text-muted-foreground font-mono">
            {content.length.toLocaleString()} chars · {lineCount} lines
          </span>
        </div>
      </div>

      {/* Protection / slug options */}
      {showProtection && (
        <div className="mb-4 rounded-xl border bg-card p-4 space-y-4 animate-fade-in">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Link2 className="w-3.5 h-3.5" />
              Custom URL Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-mono">/</span>
              <input
                type="text"
                placeholder="my-note"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="flex-1 px-3 py-2 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty for an auto-generated ID
            </p>
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

      {/* Editor */}
      <div className="relative rounded-xl border bg-editor overflow-hidden shadow-sm">
        <div className="flex">
          <div className="select-none py-4 pr-2 pl-4 text-right border-r bg-editor-line min-w-[3.5rem]">
            {Array.from({ length: Math.max(lineCount, 20) }, (_, i) => (
              <div key={i} className="text-xs leading-6 text-editor-gutter font-mono">
                {i + 1}
              </div>
            ))}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              format === "json"
                ? '{\n  "key": "value"\n}'
                : "Paste or type your content here..."
            }
            className="flex-1 resize-none bg-transparent p-4 font-mono text-sm leading-6 text-foreground placeholder:text-muted-foreground/50 focus:outline-none min-h-[480px]"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          {slug && (
            <span className="flex items-center gap-1 px-2 py-1 rounded bg-accent text-accent-foreground">
              <Link2 className="w-3 h-3" /> /{slug}
            </span>
          )}
          {password && (
            <span className="flex items-center gap-1 px-2 py-1 rounded bg-accent text-accent-foreground">
              <Lock className="w-3 h-3" /> Password set
            </span>
          )}
          {expiresIn && (
            <span className="flex items-center gap-1 px-2 py-1 rounded bg-accent text-accent-foreground">
              <Clock className="w-3 h-3" /> Expires in{" "}
              {EXPIRY_OPTIONS.find((o) => o.value === expiresIn)?.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {mode === "edit" ? "Update Note" : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
