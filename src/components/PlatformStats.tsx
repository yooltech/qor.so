import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Eye, HardDrive, TrendingUp, Loader2 } from "lucide-react";

interface PublicStats {
  total_notes: number;
  total_views: number;
  total_bytes: number;
  notes_today: number;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
};

const StatItem = ({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) => (
  <div className="text-center">
    <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
      <Icon className="w-3.5 h-3.5" />
      <span className="text-xs font-medium">{label}</span>
    </div>
    <p className="text-xl font-bold text-foreground">{value}</p>
  </div>
);

const PlatformStats = () => {
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="border-t">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-6">
          Platform Stats
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <StatItem icon={FileText} label="Active Notes" value={stats.total_notes.toLocaleString()} />
          <StatItem icon={Eye} label="Total Views" value={stats.total_views.toLocaleString()} />
          <StatItem icon={HardDrive} label="Data Stored" value={formatBytes(stats.total_bytes)} />
          <StatItem icon={TrendingUp} label="Today" value={stats.notes_today.toLocaleString()} />
        </div>
      </div>

      {/* Brand footer */}
      <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <a
          href="https://yooltech.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-foreground hover:text-primary transition-colors"
        >
          Yooltech
        </a>
        <span>
          Made with ❤️ in{" "}
          <a
            href="https://hamar.so"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-primary transition-colors font-medium"
          >
            Hamar
          </a>
        </span>
      </div>
    </div>
  );
};

export default PlatformStats;
