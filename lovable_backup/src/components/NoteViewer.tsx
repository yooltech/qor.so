import { useState } from "react";
import { Note } from "@/lib/notes";
import { Copy, Link, Download, Check, Trash2, ShieldCheck, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import { deleteNote } from "@/lib/notes";
import { useNavigate } from "react-router-dom";
import JsonHighlighter from "./JsonHighlighter";

interface NoteViewerProps {
  note: Note;
}

const NoteViewer = ({ note }: NoteViewerProps) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const copyContent = async () => {
    await navigator.clipboard.writeText(note.content);
    setCopied("content");
    toast.success("Content copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied("link");
    toast.success("Link copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadNote = () => {
    const ext = note.format === "json" ? "json" : "txt";
    const blob = new Blob([note.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `note-${note.id}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  const handleDelete = async () => {
    if (!confirm("Delete this note permanently?")) return;
    setDeleting(true);
    try {
      await deleteNote(note.id);
      toast.success("Note deleted");
      navigate("/");
    } catch {
      toast.error("Failed to delete note");
    } finally {
      setDeleting(false);
    }
  };

  const lineCount = note.content.split("\n").length;

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="px-2.5 py-1 rounded-md bg-accent text-accent-foreground text-xs font-semibold uppercase tracking-wider">
            {note.format}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {note.size_bytes.toLocaleString()} bytes · {lineCount} lines
          </span>
          {note.password_hash && (
            <span className="px-2 py-1 rounded-md bg-accent text-accent-foreground text-xs font-medium">
              🔒 Protected
            </span>
          )}
          {note.is_encrypted && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Encrypted
            </span>
          )}
          {note.expires_at && (
            <span className="px-2 py-1 rounded-md bg-accent text-accent-foreground text-xs font-medium">
              ⏱ Expires {new Date(note.expires_at).toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ActionButton
            onClick={copyContent}
            icon={copied === "content" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            label="Copy"
          />
          <ActionButton
            onClick={copyLink}
            icon={copied === "link" ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />}
            label="Link"
          />
          <ActionButton onClick={downloadNote} icon={<Download className="w-4 h-4" />} label="Download" />
          <ActionButton
            onClick={handleDelete}
            icon={<Trash2 className="w-4 h-4" />}
            label="Delete"
            variant="destructive"
            disabled={deleting}
          />
        </div>
      </div>

      {/* Title */}
      {note.title && (
        <div className="rounded-t-xl border border-b-0 bg-card px-6 pt-6 pb-2">
          <h1 className="text-2xl font-bold text-foreground">{note.title}</h1>
        </div>
      )}

      {/* Content */}
      <div className={`border bg-card overflow-hidden shadow-sm ${note.title ? "rounded-b-xl" : "rounded-xl"}`}>
        <div className="flex">
          <div className="select-none py-4 pr-2 pl-4 text-right border-r bg-secondary/30 min-w-[3.5rem]">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className="text-xs leading-7 text-muted-foreground font-mono">
                {i + 1}
              </div>
            ))}
          </div>
          <div className="flex-1 p-4 overflow-x-auto">
            {note.format === "json" ? (
              <JsonHighlighter content={note.content} />
            ) : (
              <div className="text-sm leading-7 text-foreground whitespace-pre-wrap break-words">
                {note.content.split("\n").map((line, i) => {
                  // Subtitle
                  if (line.startsWith("## ")) {
                    return <div key={i} className="font-medium text-muted-foreground">{line.slice(3)}</div>;
                  }
                  // Checked checkbox
                  if (/^- \[x\] /.test(line)) {
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="line-through text-muted-foreground">{line.slice(6)}</span>
                      </div>
                    );
                  }
                  // Unchecked checkbox
                  if (/^- \[ \] /.test(line)) {
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <Square className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span>{line.slice(6)}</span>
                      </div>
                    );
                  }
                  return <div key={i}>{line || "\u00A0"}</div>;
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground text-center font-mono">
        Created {new Date(note.created_at).toLocaleString()}
      </p>
    </div>
  );
};

function ActionButton({
  onClick,
  icon,
  label,
  variant,
  disabled,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant?: "destructive";
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
        variant === "destructive"
          ? "text-destructive hover:bg-destructive/10"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      } disabled:opacity-50`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default NoteViewer;
