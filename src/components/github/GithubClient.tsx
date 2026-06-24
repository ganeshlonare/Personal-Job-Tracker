"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GitBranch, Loader2, Link as LinkIcon, Activity, Globe, GitCommit, Users, BookOpen, Save } from "lucide-react";
import { updateUser } from "@/actions/auth.actions";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { isToday } from "date-fns";
import { useRouter } from "next/navigation";

interface GithubClientProps {
  userId: string;
  initialUsername?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function GithubClient({ userId, initialUsername = "" }: GithubClientProps) {
  const router = useRouter();
  const [username, setUsername] = useState(initialUsername);
  const [inputUsername, setInputUsername] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  
  const [profile, setProfile] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [todaysCommits, setTodaysCommits] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [heatmapSrc, setHeatmapSrc] = useState<string | null>(null);

  // Fetch from Github APIs
  useEffect(() => {
    if (!username) return;

    const fetchGithubData = async () => {
      setIsLoading(true);
      try {
        // Fetch profile
        const profileRes = await fetch(`https://api.github.com/users/${username}`, { cache: "no-store" });
        if (!profileRes.ok) throw new Error("Profile not found");
        const profileData = await profileRes.json();
        setProfile(profileData);

        // Fetch events for recent activity
        const eventsRes = await fetch(`https://api.github.com/users/${username}/events/public`, { cache: "no-store" });
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData);
        }

        // Fetch actual live commits from contribution graph
        import("@/actions/github.actions").then(async (m) => {
          const count = await m.getTodaysGithubCommits(username);
          setTodaysCommits(count);
        });

      } catch (error) {
        console.error("Failed to fetch Github data:", error);
        toast.error("Could not fetch GitHub data. Please check the username.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGithubData();
    // set heatmap src after mount to avoid hydration mismatch
    setHeatmapSrc(`https://ghchart.rshah.org/${username}?t=${Date.now()}`);
  }, [username]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUsername.trim()) return;

    setIsConnecting(true);
    try {
      // Validate user exists before saving
      const res = await fetch(`https://api.github.com/users/${inputUsername}`);
      if (!res.ok) {
        toast.error("GitHub user not found!");
        setIsConnecting(false);
        return;
      }

      const result = await updateUser(userId, { githubUsername: inputUsername });
      if (result.error) {
        toast.error(result.error);
      } else {
        setUsername(inputUsername);
        toast.success("GitHub account connected!");
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to connect account");
    } finally {
      setIsConnecting(false);
    }
  };

  const cardStyle = {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  };

  if (!username) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-12">
        <div className="text-center space-y-4 mb-8">
          <div className="w-16 h-16 bg-[#24292e] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <GitBranch className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>Connect your GitHub</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Link your GitHub account to sync your daily commits, view your live contribution heatmap, and track your coding activity.
          </p>
        </div>

        <form onSubmit={handleConnect} className="p-6 md:p-8 rounded-2xl space-y-6 border" style={cardStyle}>
          <div className="flex items-center gap-3 max-w-md mx-auto">
            <input
              type="text"
              placeholder="e.g. ganeshlonare"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#24292e] transition-all"
              style={{ background: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
            />
            <button
              onClick={handleConnect}
              disabled={isConnecting || !inputUsername}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              style={{ background: "#24292e" }}
            >
              {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Connect
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="GitHub Profile" description="Your live open-source stats synced from GitHub" />
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium" style={{ background: "var(--color-card)", borderColor: "var(--color-border)", color: "var(--color-foreground)" }}>
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-500 font-bold">{todaysCommits}</span> commits today
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium" style={{ background: "var(--color-card)", borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }}>
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            Live Sync Active
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#24292e]" />
          <p className="text-sm font-medium" style={{ color: "var(--color-muted-foreground)" }}>Fetching latest GitHub stats...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Profile Card */}
            <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
              {profile && (
                <div className="rounded-2xl p-6 text-center border relative overflow-hidden" style={cardStyle}>
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-[#24292e]/20 to-[#24292e]/5" />
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    className="w-24 h-24 rounded-full border-4 mx-auto relative z-10 shadow-lg object-cover bg-white" 
                    style={{ borderColor: "var(--color-card)" }} 
                  />
                  
                  <h2 className="text-xl font-bold mt-4" style={{ color: "var(--color-foreground)" }}>{profile.name || username}</h2>
                  <p className="text-sm font-medium mb-4" style={{ color: "var(--color-muted-foreground)" }}>@{username}</p>
                  
                  <div className="flex items-center justify-center gap-4 text-sm mb-6 pb-6 border-b" style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}>
                    <div className="flex flex-col items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-bold">{profile.followers}</span>
                      <span className="text-xs text-muted-foreground">Followers</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="font-bold">{profile.public_repos}</span>
                      <span className="text-xs text-muted-foreground">Repos</span>
                    </div>
                  </div>

                  <a 
                    href={profile.html_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border transition-colors text-sm font-semibold"
                    style={{ background: "var(--color-secondary)", borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
                  >
                    View on GitHub <Globe className="w-4 h-4" />
                  </a>
                </div>
              )}
            </motion.div>

            {/* Right Column: Heatmap & Recent Activity */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
              {/* Contribution Heatmap using ghchart SVG */}
              <div className="rounded-2xl p-6 border flex flex-col" style={cardStyle}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg" style={{ color: "var(--color-foreground)" }}>Contributions Heatmap</h3>
                  <div className="p-2 rounded-lg" style={{ background: "var(--color-secondary)" }}>
                    <GitCommit className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="overflow-x-auto pb-4 custom-scrollbar">
                  <div className="min-w-[700px] flex justify-center py-4 rounded-xl border bg-white dark:bg-[#0d1117] px-4" style={{ borderColor: "var(--color-border)" }}>
                    {/* Dark mode supports using the chart from rshah, but it's fundamentally an SVG we can load directly */}
                      <img
                        src={heatmapSrc || `https://ghchart.rshah.org/${username}`}
                        alt={`${username}'s Github chart`}
                        className="max-w-full dark:invert dark:hue-rotate-180 dark:brightness-110"
                        referrerPolicy="no-referrer"
                      />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-2xl p-6 border" style={cardStyle}>
                <h3 className="font-bold text-lg mb-4" style={{ color: "var(--color-foreground)" }}>Recent Public Activity</h3>
                
                <div className="space-y-4">
                  {events.slice(0, 5).map((event, i) => (
                    <div key={i} className="p-4 rounded-xl border bg-[var(--color-secondary)] flex items-start gap-4">
                      <div className="p-2 rounded-full bg-primary/10 text-primary mt-0.5">
                        <GitCommit className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: "var(--color-foreground)" }}>
                          {event.type.replace("Event", "")} on <a href={`https://github.com/${event.repo.name}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">{event.repo.name}</a>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(event.created_at).toLocaleString()}
                        </p>
                        {event.type === "PushEvent" && event.payload.commits && (
                          <div className="mt-2 space-y-1">
                            {event.payload.commits.slice(0, 2).map((commit: any, cIdx: number) => (
                              <p key={cIdx} className="text-xs text-muted-foreground truncate font-mono">
                                • {commit.message}
                              </p>
                            ))}
                            {event.payload.commits.length > 2 && (
                              <p className="text-xs text-muted-foreground font-mono">...and {event.payload.commits.length - 2} more</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {events.length === 0 && (
                    <p className="text-sm text-center py-4 text-muted-foreground">No recent public activity found.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}
