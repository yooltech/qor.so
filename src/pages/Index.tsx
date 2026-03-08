import NoteEditor from "@/components/NoteEditor";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
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
          <span className="text-xs text-muted-foreground font-mono hidden sm:block">
            save · share · instantly
          </span>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
          Save it. Share it.{" "}
          <span className="text-primary">Instantly.</span>
        </h1>
        <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
          Paste text or JSON, get a shareable link. No signup required.
        </p>
      </div>

      {/* Editor */}
      <div className="px-6 pb-20">
        <NoteEditor />
      </div>
    </div>
  );
};

export default Index;
