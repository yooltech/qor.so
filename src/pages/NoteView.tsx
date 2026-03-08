import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getNote } from "@/lib/notes";
import { verifyPassword } from "@/lib/crypto";
import { supabase } from "@/integrations/supabase/client";
import NoteViewer from "@/components/NoteViewer";
import ThemeToggle from "@/components/ThemeToggle";
import { FileText, Loader2, Lock, Clock } from "lucide-react";
import { toast } from "sonner";

const NoteView = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);

  const { data: note, isLoading, error } = useQuery({
    queryKey: ["note", idOrSlug],
    queryFn: () => getNote(idOrSlug!),
    enabled: !!idOrSlug,
  });

  useEffect(() => {
    if (note && !viewTracked) {
      supabase.rpc("increment_note_view", { note_id: note.id }).then(() => {
        setViewTracked(true);
      });
    }
  }, [note, viewTracked]);

  const isPasswordProtected = note?.password_hash && !unlocked;
  const isExpired = note?.expires_at && new Date(note.expires_at) <= new Date();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note?.password_hash) return;
    setVerifying(true);
    const valid = await verifyPassword(passwordInput, note.password_hash);
    if (valid) {
      setUnlocked(true);
    } else {
      toast.error("Incorrect password");
    }
    setVerifying(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">NoteShare</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              + New Note
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
            <p className="text-xl font-semibold text-foreground">Note not found</p>
            <p className="mt-2 text-muted-foreground">
              This note may have been deleted, expired, or the link is invalid.
            </p>
            <Link
              to="/"
              className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
            >
              Create a New Note
            </Link>
          </div>
        )}

        {note && isExpired && (
          <div className="text-center py-20 animate-fade-in">
            <Clock className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-foreground">Note Expired</p>
            <p className="mt-2 text-muted-foreground">
              This note expired on {new Date(note.expires_at!).toLocaleString()}.
            </p>
            <Link
              to="/"
              className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
            >
              Create a New Note
            </Link>
          </div>
        )}

        {note && !isExpired && isPasswordProtected && (
          <div className="max-w-md mx-auto text-center py-20 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-6">
              <Lock className="w-7 h-7 text-accent-foreground" />
            </div>
            <p className="text-xl font-semibold text-foreground">This note is protected</p>
            <p className="mt-2 text-muted-foreground text-sm">
              Enter the password to view this note.
            </p>
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

        {note && !isExpired && !isPasswordProtected && <NoteViewer note={note} />}
      </div>
    </div>
  );
};

export default NoteView;
