import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  FileText, Loader2, Shield, Trash2, Ban, UserCheck, Users,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  display_name: string | null;
  avatar_url: string | null;
  banned: boolean;
}

const Admin = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: isAdmin, isLoading: checkingRole } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      const { data } = await supabase.rpc("has_role", {
        _user_id: user!.id,
        _role: "admin",
      });
      return !!data;
    },
    enabled: !!user,
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch users");
      const json = await res.json();
      return json.users as AdminUser[];
    },
    enabled: !!isAdmin,
  });

  const actionMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: "ban" | "unban" | "delete" }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const method = action === "delete" ? "DELETE" : "POST";
      const body = action === "delete"
        ? JSON.stringify({ userId })
        : JSON.stringify({ userId, action });

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`,
        {
          method,
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
          body,
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Action failed");
      }
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(
        action === "delete" ? "User deleted" : action === "ban" ? "User banned" : "User unbanned"
      );
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl font-semibold text-foreground">Access Denied</p>
          <p className="mt-2 text-muted-foreground">You don't have admin privileges.</p>
          <Link
            to="/"
            className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
          >
            Go Home
          </Link>
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
              to="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Admin · Users</h1>
        </div>

        <p className="text-muted-foreground text-sm mb-6">
          {users.length} registered user{users.length !== 1 ? "s" : ""}
        </p>

        {/* Search */}
        <div className="relative mb-6">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((u) => (
              <div
                key={u.id}
                className={`rounded-xl border bg-card p-4 flex items-center justify-between gap-4 ${
                  u.banned ? "opacity-60" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground truncate">
                      {u.display_name || "No name"}
                    </p>
                    {u.banned && (
                      <span className="px-2 py-0.5 rounded bg-destructive/10 text-destructive text-xs font-medium">
                        Banned
                      </span>
                    )}
                    {u.id === user?.id && (
                      <span className="px-2 py-0.5 rounded bg-accent text-accent-foreground text-xs font-medium">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">{u.email}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Joined {new Date(u.created_at).toLocaleDateString()}
                    {u.last_sign_in_at && ` · Last seen ${new Date(u.last_sign_in_at).toLocaleDateString()}`}
                  </p>
                </div>
                {u.id !== user?.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    {u.banned ? (
                      <button
                        onClick={() => actionMutation.mutate({ userId: u.id, action: "unban" })}
                        className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                        title="Unban"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (confirm(`Ban ${u.email}?`)) actionMutation.mutate({ userId: u.id, action: "ban" });
                        }}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Ban"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`Permanently delete ${u.email}? This cannot be undone.`))
                          actionMutation.mutate({ userId: u.id, action: "delete" });
                      }}
                      className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
