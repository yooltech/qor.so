import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getNote } from "@/lib/notes";
import NoteViewer from "@/components/NoteViewer";
import { FileText, Loader2 } from "lucide-react";

const NoteView = () => {
  const { id } = useParams<{ id: string }>();

  const { data: note, isLoading, error } = useQuery({
    queryKey: ["note", id],
    queryFn: () => getNote(id!),
    enabled: !!id,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">NoteShare</span>
          </Link>
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            + New Note
          </Link>
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
              This note may have been deleted or the link is invalid.
            </p>
            <Link
              to="/"
              className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
            >
              Create a New Note
            </Link>
          </div>
        )}

        {note && <NoteViewer note={note} />}
      </div>
    </div>
  );
};

export default NoteView;
