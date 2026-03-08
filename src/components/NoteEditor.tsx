import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNote } from "@/lib/notes";
import { toast } from "sonner";
import { FileText, Braces, Save, Loader2 } from "lucide-react";

const NoteEditor = () => {
  const [content, setContent] = useState("");
  const [format, setFormat] = useState<"text" | "json">("text");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const lineCount = content.split("\n").length;

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Please enter some content");
      return;
    }
    setSaving(true);
    try {
      const note = await createNote(content, format);
      toast.success("Note saved!");
      navigate(`/note/${note.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
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

        <span className="text-xs text-muted-foreground font-mono">
          {content.length.toLocaleString()} chars · {lineCount} lines
        </span>
      </div>

      {/* Editor */}
      <div className="relative rounded-xl border bg-editor overflow-hidden shadow-sm">
        {/* Line numbers gutter */}
        <div className="flex">
          <div className="select-none py-4 pr-2 pl-4 text-right border-r bg-editor-line min-w-[3.5rem]">
            {Array.from({ length: Math.max(lineCount, 20) }, (_, i) => (
              <div
                key={i}
                className="text-xs leading-6 text-editor-gutter font-mono"
              >
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

      {/* Save button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || !content.trim()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Note
        </button>
      </div>
    </div>
  );
};

export default NoteEditor;
