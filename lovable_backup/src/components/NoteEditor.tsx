import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createNote } from "@/lib/notes";
import { toast } from "sonner";
import {
  FileText, Braces, Save, Loader2, Lock, Clock, Link2,
  CheckSquare, Square, Plus,
} from "lucide-react";

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
  title?: string;
  password?: string;
  slug?: string;
  expiresIn?: number | null;
}

interface NoteEditorProps {
  initialContent?: string;
  initialFormat?: "text" | "json";
  initialTitle?: string;
  initialSlug?: string;
  initialHasPassword?: boolean;
  initialExpiresAt?: string | null;
  mode?: "create" | "edit";
  onSave?: (opts: NoteEditOptions) => void;
  onCancel?: () => void;
  saving?: boolean;
}

// Parse a line to see if it's a checkbox
function parseCheckbox(line: string): { isCheckbox: boolean; checked: boolean; text: string } {
  const checkedMatch = line.match(/^- \[x\] (.*)$/);
  if (checkedMatch) return { isCheckbox: true, checked: true, text: checkedMatch[1] };
  const uncheckedMatch = line.match(/^- \[ \] (.*)$/);
  if (uncheckedMatch) return { isCheckbox: true, checked: false, text: uncheckedMatch[1] };
  return { isCheckbox: false, checked: false, text: line };
}

const NoteEditor = ({
  initialContent = "",
  initialFormat = "text",
  initialTitle = "",
  initialSlug = "",
  initialHasPassword = false,
  initialExpiresAt,
  mode = "create",
  onSave,
  onCancel,
  saving: externalSaving,
}: NoteEditorProps) => {
  // Parse initial content: extract subtitle from first line if it starts with "## "
  const parseInitial = () => {
    const lines = initialContent.split("\n");
    if (lines.length > 0 && lines[0].startsWith("## ")) {
      return { subtitle: lines[0].slice(3), body: lines.slice(1).join("\n").replace(/^\n/, "") };
    }
    return { subtitle: "", body: initialContent };
  };

  const { subtitle: initSub, body: initBody } = parseInitial();

  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initSub);
  const [body, setBody] = useState(initBody);
  const [format, setFormat] = useState<"text" | "json">(initialFormat);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [slug, setSlug] = useState(initialSlug);
  const [showOptions, setShowOptions] = useState(false);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const navigate = useNavigate();
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const isSaving = externalSaving || saving;

  // Build full content from subtitle + body
  const buildContent = useCallback(() => {
    const parts: string[] = [];
    if (subtitle.trim()) parts.push(`## ${subtitle}`);
    parts.push(body);
    return parts.join("\n");
  }, [subtitle, body]);

  const charCount = (title + subtitle + body).length;
  const lineCount = body.split("\n").length;

  const handleSave = async () => {
    const content = buildContent();
    if (!content.trim() && !title.trim()) {
      toast.error("Please enter some content");
      return;
    }

    if (mode === "edit" && onSave) {
      onSave({ content, format, title: title || undefined, password: password || undefined, slug: slug || undefined, expiresIn });
      return;
    }

    setSaving(true);
    try {
      const note = await createNote({
        content,
        format,
        title: title || undefined,
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

  // Toggle a checkbox line
  const toggleCheckbox = (lineIndex: number) => {
    const lines = body.split("\n");
    const line = lines[lineIndex];
    const parsed = parseCheckbox(line);
    if (parsed.isCheckbox) {
      lines[lineIndex] = parsed.checked
        ? `- [ ] ${parsed.text}`
        : `- [x] ${parsed.text}`;
      setBody(lines.join("\n"));
    }
  };

  // Insert a new checkbox at cursor
  const insertCheckbox = () => {
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const before = body.slice(0, start);
    const after = body.slice(start);
    // Find if we're at the start of a line
    const lastNewline = before.lastIndexOf("\n");
    const lineStart = lastNewline + 1;
    const prefix = before.slice(lineStart);

    if (prefix.trim() === "") {
      // Empty line, just insert checkbox
      const newBody = before + "- [ ] " + after;
      setBody(newBody);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 6;
        ta.focus();
      }, 0);
    } else {
      // Insert on new line
      const newBody = before + "\n- [ ] " + after;
      setBody(newBody);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 7;
        ta.focus();
      }, 0);
    }
  };

  // Handle enter key in body to continue checkbox lines
  const handleBodyKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const before = body.slice(0, start);
      const lastNewline = before.lastIndexOf("\n");
      const currentLine = before.slice(lastNewline + 1);

      if (/^- \[[ x]\] .+$/.test(currentLine)) {
        e.preventDefault();
        const after = body.slice(start);
        const newBody = before + "\n- [ ] " + after;
        setBody(newBody);
        setTimeout(() => {
          ta.selectionStart = ta.selectionEnd = start + 7;
        }, 0);
      } else if (/^- \[[ x]\] $/.test(currentLine)) {
        // Empty checkbox line, remove it
        e.preventDefault();
        const lineStartPos = lastNewline + 1;
        const after = body.slice(start);
        const newBody = body.slice(0, lineStartPos) + after;
        setBody(newBody);
        setTimeout(() => {
          ta.selectionStart = ta.selectionEnd = lineStartPos;
        }, 0);
      }
    }
  };

  // Render body lines with interactive checkboxes overlay
  const bodyLines = body.split("\n");

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
          {format === "text" && (
            <button
              onClick={insertCheckbox}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              title="Add checkbox"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Checklist
            </button>
          )}
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
          <span className="text-xs text-muted-foreground font-mono">
            {charCount.toLocaleString()} chars · {lineCount} lines
          </span>
        </div>
      </div>

      {/* Options panel */}
      {showOptions && (
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
            <p className="text-xs text-muted-foreground mt-1">Leave empty for an auto-generated ID</p>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Lock className="w-3.5 h-3.5" />
              Password Protection
            </label>
            <input
              type="password"
              placeholder={mode === "edit" && initialHasPassword ? "Leave empty to keep current password" : "Leave empty for no password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {mode === "edit" && initialHasPassword && !password && (
              <p className="text-xs text-muted-foreground mt-1">Current password will be kept</p>
            )}
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

      {/* Apple Notes-style editor */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        {/* Title */}
        <div className="px-6 pt-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-transparent text-2xl font-bold text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
          />
        </div>

        {/* Subtitle */}
        <div className="px-6 pt-2">
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Subtitle"
            className="w-full bg-transparent text-base font-medium text-muted-foreground placeholder:text-muted-foreground/30 focus:outline-none"
          />
        </div>

        {/* Divider */}
        <div className="mx-6 mt-3 border-b" />

        {/* Body area */}
        {format === "text" ? (
          <div className="relative px-6 py-4">
            {/* Checkbox overlay */}
            <div className="absolute inset-0 px-6 py-4 pointer-events-none" aria-hidden>
              {bodyLines.map((line, i) => {
                const parsed = parseCheckbox(line);
                if (!parsed.isCheckbox) return (
                  <div key={i} className="h-7 flex items-center">
                    <span className="opacity-0">placeholder</span>
                  </div>
                );
                return (
                  <div key={i} className="h-7 flex items-center gap-2 pointer-events-auto">
                    <button
                      onClick={() => toggleCheckbox(i)}
                      className="flex-shrink-0 text-primary hover:scale-110 transition-transform"
                    >
                      {parsed.checked ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Textarea */}
            <textarea
              ref={bodyRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={handleBodyKeyDown}
              placeholder="Start writing..."
              className="w-full resize-none bg-transparent text-sm leading-7 text-foreground placeholder:text-muted-foreground/40 focus:outline-none min-h-[360px]"
              style={{
                // Indent lines that have checkboxes
                ...(body.includes("- [") ? {} : {}),
              }}
              spellCheck={false}
            />
          </div>
        ) : (
          /* JSON mode: keep code style */
          <div className="relative overflow-hidden">
            <div className="flex">
              <div className="select-none py-4 pr-2 pl-4 text-right border-r bg-secondary/30 min-w-[3.5rem]">
                {Array.from({ length: Math.max(lineCount, 20) }, (_, i) => (
                  <div key={i} className="text-xs leading-6 text-muted-foreground font-mono">
                    {i + 1}
                  </div>
                ))}
              </div>
              <textarea
                ref={bodyRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={'{\n  "key": "value"\n}'}
                className="flex-1 resize-none bg-transparent p-4 font-mono text-sm leading-6 text-foreground placeholder:text-muted-foreground/50 focus:outline-none min-h-[360px]"
                spellCheck={false}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action bar */}
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
            disabled={isSaving || (!body.trim() && !title.trim())}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
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
