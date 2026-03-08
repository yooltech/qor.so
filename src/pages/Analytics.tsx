import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { FileText, Eye, HardDrive, TrendingUp, Loader2, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface PublicStats {
  total_notes: number;
  total_views: number;
  total_bytes: number;
  notes_today: number;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle?: string;
}) => (
  <div className="rounded-xl border bg-card p-6 text-center">
    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mx-auto mb-3">
      <Icon className="w-5 h-5 text-accent-foreground" />
    </div>
    <p className="text-3xl font-bold text-foreground">{value}</p>
    <p className="text-sm font-medium text-muted-foreground mt-1">{label}</p>
    {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
  </div>
);

const Analytics = () => {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["public-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_stats" as any)
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as PublicStats;
    },
  });

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1073741824).toFixed(1)} GB`;
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
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              + New Note
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16 animate-fade-in">
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            Platform Analytics
          </h1>
          <p className="mt-3 text-muted-foreground text-lg">
            Live stats from the NoteShare community
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              icon={FileText}
              label="Active Notes"
              value={stats.total_notes.toLocaleString()}
            />
            <StatCard
              icon={Eye}
              label="Total Views"
              value={stats.total_views.toLocaleString()}
            />
            <StatCard
              icon={HardDrive}
              label="Data Stored"
              value={formatBytes(stats.total_bytes)}
            />
            <StatCard
              icon={TrendingUp}
              label="Notes Today"
              value={stats.notes_today.toLocaleString()}
              subtitle="last 24 hours"
            />
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Unable to load stats</p>
        )}

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Ready to share something?
          </p>
          <Link
            to="/"
            className="inline-block mt-4 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all"
          >
            Create a Note
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
