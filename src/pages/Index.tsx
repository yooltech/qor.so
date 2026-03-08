import { useState } from "react";
import NoteEditor from "@/components/NoteEditor";
import FileUploader from "@/components/FileUploader";
import PlatformStats from "@/components/PlatformStats";
import { FileText, LayoutDashboard, LogIn, Upload, ShieldCheck, Braces } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";

const Index = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<"note" | "file">("note");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
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
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
          Save it. Share it.{" "}
          <span className="text-primary">Instantly.</span>
        </h1>
        <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
          Paste text, JSON, or upload files — get a shareable link. No signup required.
        </p>
        {user ? (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <ShieldCheck className="w-4 h-4" />
            Your notes are encrypted at rest
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to encrypt your notes automatically
          </p>
        )}
      </div>

      {/* Mode toggle */}
      <div className="max-w-4xl mx-auto px-6 mb-6">
        <div className="flex items-center gap-1 rounded-lg bg-secondary p-1 w-fit mx-auto">
          <button
            onClick={() => setMode("note")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === "note"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Braces className="w-4 h-4" />
            Note
          </button>
          <button
            onClick={() => setMode("file")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === "file"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="w-4 h-4" />
            File
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-20 flex-1">
        {mode === "note" ? <NoteEditor /> : <FileUploader />}
      </div>

      {/* Footer Stats */}
      <PlatformStats />
    </div>
  );
};

export default Index;
