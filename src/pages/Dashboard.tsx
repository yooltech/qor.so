import { useState } from "react";
import { hashPassword } from "@/lib/crypto";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  FileText, Search, Trash2, ExternalLink, Edit3, Loader2, LogOut, Plus,
  Eye, HardDrive, TrendingUp, User,
} from "lucide-react";
import type { Note } from "@/lib/notes";
import NoteEditor from "@/components/NoteEditor";
import ThemeToggle from "@/components/ThemeToggle";

const StatCard = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="rounded-xl border bg-card p-4">
    <div className="flex items-center gap-2 text-muted-foreground mb-1">
      <Icon className="w-4 h-4" />
      <span className="text-xs font-medium">{label}</span>
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
  </div>
);

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["my-notes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Note[];
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-notes"] });
      toast.success("Note deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await supabase
        .from("notes")
        .update({ content, size_bytes: content.length })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-notes"] });
      setEditingId(null);
      setEditingNote(null);
      toast.success("Note updated");
    },
    onError: () => toast.error("Failed to update"),
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditingNote(note);
  };

  const filtered = notes.filter(
    (n) =>
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      (n.title && n.title.toLowerCase().includes(search.toLowerCase()))
  );

  const totalViews = notes.reduce((sum, n) => sum + (n.view_count || 0), 0);
  const totalBytes = notes.reduce((sum, n) => sum + n.size_bytes, 0);
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  // If editing, show the full editor
  if (editingId && editingNote) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">qor.so</span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </nav>
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h2 className="text-2xl font-bold text-foreground mb-6">Edit Note</h2>
          <NoteEditor
            initialContent={editingNote.content}
            initialFormat={editingNote.format}
            mode="edit"
            saving={updateMutation.isPending}
            onSave={(content) => updateMutation.mutate({ id: editingId, content })}
            onCancel={() => { setEditingId(null); setEditingNote(null); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">qor.so</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/profile"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Note</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">My Notes</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          {notes.length} note{notes.length !== 1 ? "s" : ""} saved
        </p>

        {/* Stats cards */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={FileText} label="Total Notes" value={notes.length.toString()} />
          <StatCard icon={Eye} label="Total Views" value={totalViews.toLocaleString()} />
          <StatCard icon={HardDrive} label="Storage Used" value={formatBytes(totalBytes)} />
          <StatCard
            icon={TrendingUp}
            label="Most Viewed"
            value={notes.length > 0 ? Math.max(...notes.map(n => n.view_count || 0)).toLocaleString() : "0"}
          />
        </div>

        {/* Search */}
        <div className="mt-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>

        {/* Notes list */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              {search ? "No notes match your search" : "No notes yet"}
            </p>
            {!search && (
              <Link
                to="/"
                className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
              >
                Create Your First Note
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {filtered.map((note) => (
              <div
                key={note.id}
                className="rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-accent text-accent-foreground text-xs font-semibold uppercase">
                        {note.format}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {note.size_bytes.toLocaleString()} bytes
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                        <Eye className="w-3 h-3" />
                        {(note.view_count || 0).toLocaleString()}
                      </span>
                      {note.slug && (
                        <span className="text-xs text-primary font-mono">
                          /{note.slug}
                        </span>
                      )}
                    </div>
                    <pre className="font-mono text-sm text-foreground truncate max-w-full">
                      {note.content.slice(0, 120)}
                      {note.content.length > 120 ? "..." : ""}
                    </pre>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      to={`/${note.slug || note.id}`}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="View"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => startEdit(note)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this note?")) deleteMutation.mutate(note.id);
                      }}
                      className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
