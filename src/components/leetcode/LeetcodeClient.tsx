"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Search, Code2, Globe, ExternalLink, Loader2, Save, Calendar as CalendarIcon, CheckCircle2, ChevronRight, Activity, Flame } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { updateUser } from "@/actions/auth.actions";
import { formatRelativeDate } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface LeetcodeClientProps {
  initialUsername: string;
  userId: string;
}

interface ProfileData {
  name: string;
  avatar: string;
  ranking: number;
  about: string;
  country: string;
  reputation: number;
}

interface SolvedData {
  solvedProblem: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSubmissionNum: { difficulty: string; count: number; submissions: number }[];
}

interface Submission {
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
}

interface CalendarData {
  activeYears: number[];
  streak: number;
  totalActiveDays: number;
  submissionCalendar: string; // JSON string of unix seconds -> count
}

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function LeetcodeClient({ initialUsername, userId }: LeetcodeClientProps) {
  const router = useRouter();
  const [username, setUsername] = useState(initialUsername);
  const [inputName, setInputName] = useState(initialUsername);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [solved, setSolved] = useState<SolvedData | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [calendar, setCalendar] = useState<CalendarData | null>(null);

  useEffect(() => {
    if (!username) return;
    
    const fetchLeetcodeData = async () => {
      setIsLoading(true);
      try {
        const [profileRes, solvedRes, subRes, calRes] = await Promise.all([
          fetch(`https://alfa-leetcode-api.onrender.com/${username}`),
          fetch(`https://alfa-leetcode-api.onrender.com/${username}/solved`),
          fetch(`https://alfa-leetcode-api.onrender.com/${username}/acSubmission`),
          fetch(`https://alfa-leetcode-api.onrender.com/${username}/calendar`),
        ]);

        if (profileRes.ok) setProfile(await profileRes.json());
        if (solvedRes.ok) setSolved(await solvedRes.json());
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubmissions(subData.submission || []);
        }
        if (calRes.ok) setCalendar(await calRes.json());
      } catch (error) {
        console.error("Failed to fetch LeetCode data", error);
        toast.error("Failed to sync with LeetCode. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeetcodeData();
  }, [username]);

  const handleSaveUsername = async () => {
    if (!inputName.trim()) return;
    setIsSaving(true);
    try {
      const res = await updateUser(userId, { leetcodeUsername: inputName.trim() });
      if (res.error) throw new Error(res.error);
      
      setUsername(inputName.trim());
      toast.success("LeetCode profile linked successfully!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to link account");
    } finally {
      setIsSaving(false);
    }
  };

  const cardStyle = { background: "var(--color-card)", border: "1px solid var(--color-border)" };

  if (!username) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto mt-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center p-12 rounded-3xl" style={cardStyle}>
          <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Code2 className="w-10 h-10 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-foreground)" }}>Connect LeetCode</h2>
          <p className="text-sm mb-8" style={{ color: "var(--color-muted-foreground)" }}>
            Link your LeetCode username to automatically sync your stats, submissions, and problem-solving history.
          </p>
          <div className="flex items-center gap-3 max-w-md mx-auto">
            <input
              type="text"
              placeholder="Enter your username (e.g. ganeshlonare)"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
              style={{ background: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
            />
            <button
              onClick={handleSaveUsername}
              disabled={isSaving || !inputName}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              style={{ background: "#F59E0B" }}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Connect
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const chartData = solved ? [
    { name: "Easy", value: solved.easySolved, color: "#22C55E" },
    { name: "Medium", value: solved.mediumSolved, color: "#F59E0B" },
    { name: "Hard", value: solved.hardSolved, color: "#EF4444" },
  ] : [];

  // Calculate today's solved
  let todaysCount = 0;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTodaySecs = Math.floor(startOfToday.getTime() / 1000);

  const todaysSubmissions = submissions.filter(sub => parseInt(sub.timestamp) >= startOfTodaySecs);
  
  // Use unique titles to count distinct problems solved today
  const uniqueTodaysProblems = new Set(todaysSubmissions.map(s => s.titleSlug));
  todaysCount = uniqueTodaysProblems.size;

  // Process Calendar Heatmap
  let maxSubmissions = 1;
  let parsedCalendar: Record<string, number> = {};
  if (calendar && calendar.submissionCalendar) {
    try {
      parsedCalendar = JSON.parse(calendar.submissionCalendar);
      maxSubmissions = Math.max(1, ...Object.values(parsedCalendar));
    } catch (e) {
      console.error(e);
    }
  }

  // Generate 52 weeks grid (364 days to make 52 exact columns of 7 days)
  const daysInGrid = 52 * 7;
  const heatmapDays: { date: Date; count: number; intensity: number }[] = [];
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  
  for (let i = daysInGrid - 1; i >= 0; i--) {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - i);
    const secs = Math.floor(d.getTime() / 1000);
    // Find closest key in parsedCalendar (Leetcode timestamps might vary by timezone)
    let count = 0;
    for (let k in parsedCalendar) {
      const kNum = parseInt(k);
      // If within the same day (86400 seconds)
      if (Math.abs(kNum - secs) < 86400) {
        count += parsedCalendar[k];
        delete parsedCalendar[k]; // prevent double counting
      }
    }
    
    let intensity = 0;
    if (count > 0) {
      intensity = Math.max(1, Math.ceil((count / maxSubmissions) * 4)); // 1 to 4 scale
    }
    heatmapDays.push({ date: d, count, intensity });
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="LeetCode Profile" description="Your live coding stats synced from LeetCode" />
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium" style={{ background: "var(--color-card)", borderColor: "var(--color-border)", color: "var(--color-foreground)" }}>
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-500 font-bold">{todaysCount}</span> solved today
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium" style={{ background: "var(--color-card)", borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }}>
            <Globe className="w-3.5 h-3.5 text-green-500" />
            Live Sync Active
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          <p className="text-sm font-medium" style={{ color: "var(--color-muted-foreground)" }}>Fetching latest LeetCode stats...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Profile Card */}
            <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
              {profile && (
                <div className="rounded-2xl p-6 text-center border relative overflow-hidden" style={cardStyle}>
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-yellow-500/20 to-orange-500/20" />
                  <img 
                    src={profile.avatar} 
                    alt="Avatar" 
                    className="w-24 h-24 rounded-full border-4 mx-auto relative z-10 shadow-lg object-cover bg-[var(--color-secondary)]" 
                    style={{ borderColor: "var(--color-card)" }}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://assets.leetcode.com/users/default_avatar.jpg";
                    }}
                  />
                  
                  <h2 className="text-xl font-bold mt-4" style={{ color: "var(--color-foreground)" }}>{profile.name}</h2>
                  <p className="text-sm text-yellow-500 font-medium mb-4">@{username}</p>
                  
                  <div className="flex items-center justify-center gap-4 text-sm mb-6 pb-6 border-b" style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}>
                    <div className="text-center">
                      <p className="font-bold text-lg">{profile.ranking.toLocaleString()}</p>
                      <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Global Rank</p>
                    </div>
                    <div className="w-px h-8 bg-[var(--color-border)]" />
                    <div className="text-center">
                      <p className="font-bold text-lg">{profile.reputation}</p>
                      <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Reputation</p>
                    </div>
                  </div>

                  <a
                    href={`https://leetcode.com/u/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-colors border hover:bg-yellow-500/10 hover:text-yellow-500 hover:border-yellow-500/30"
                    style={{ background: "var(--color-secondary)", borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
                  >
                    View on LeetCode <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Solved Stats */}
              {solved && (
                <div className="rounded-2xl p-6 border" style={cardStyle}>
                  <h3 className="font-semibold mb-6 flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
                    <Code2 className="w-4 h-4 text-yellow-500" /> Problems Solved
                  </h3>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-28 h-28 relative flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            innerRadius={30}
                            outerRadius={45}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: "var(--color-card)", border: "none", borderRadius: "8px", fontSize: "12px" }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-bold" style={{ color: "var(--color-foreground)" }}>{solved.solvedProblem}</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      {[
                        { label: "Easy", count: solved.easySolved, total: solved.totalSubmissionNum.find(x => x.difficulty === "Easy")?.count || 0, color: "#22C55E" },
                        { label: "Medium", count: solved.mediumSolved, total: solved.totalSubmissionNum.find(x => x.difficulty === "Medium")?.count || 0, color: "#F59E0B" },
                        { label: "Hard", count: solved.hardSolved, total: solved.totalSubmissionNum.find(x => x.difficulty === "Hard")?.count || 0, color: "#EF4444" },
                      ].map(s => (
                        <div key={s.label}>
                          <div className="flex justify-between text-xs font-medium mb-1">
                            <span style={{ color: "var(--color-muted-foreground)" }}>{s.label}</span>
                            <span style={{ color: "var(--color-foreground)" }}>{s.count} <span className="opacity-50">/ {s.total}</span></span>
                          </div>
                          <div className="h-1.5 w-full bg-[var(--color-secondary)] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${(s.count / s.total) * 100}%`, background: s.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Right Column: Submissions & Calendar */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
              
              {/* Contribution Calendar */}
              {calendar && (
                <div className="rounded-2xl p-6 border overflow-hidden" style={cardStyle}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
                      <CalendarIcon className="w-4 h-4 text-indigo-500" /> 
                      {Object.values(parsedCalendar).reduce((a,b)=>a+b, 0) + heatmapDays.reduce((a,b)=>a+b.count,0)} submissions in the past year
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-medium">
                      <span className="flex items-center gap-1 text-[var(--color-muted-foreground)]">
                        Total active days: <span className="text-[var(--color-foreground)]">{calendar.totalActiveDays}</span>
                      </span>
                      <span className="flex items-center gap-1 text-[var(--color-muted-foreground)]">
                        Max streak: <span className="text-[var(--color-foreground)]">{calendar.streak}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto pb-4 custom-scrollbar">
                    <div className="flex gap-1.5 min-w-max">
                      {Array.from({ length: 52 }).map((_, weekIdx) => (
                        <div key={weekIdx} className="flex flex-col gap-1.5">
                          {Array.from({ length: 7 }).map((_, dayIdx) => {
                            const day = heatmapDays[weekIdx * 7 + dayIdx];
                            if (!day) return <div key={dayIdx} className="w-[14px] h-[14px] rounded-sm opacity-0" />;
                            
                            let bgClass = "bg-[var(--color-secondary)]";
                            if (day.intensity === 1) bgClass = "bg-green-900/50";
                            if (day.intensity === 2) bgClass = "bg-green-700";
                            if (day.intensity === 3) bgClass = "bg-green-500";
                            if (day.intensity === 4) bgClass = "bg-green-400";

                            return (
                              <div 
                                key={dayIdx} 
                                className={`w-[14px] h-[14px] rounded-sm ${bgClass} hover:ring-2 ring-foreground/20 cursor-pointer transition-all`}
                                title={`${day.count} submissions on ${day.date.toDateString()}`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-2 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                    <span>Less</span>
                    <div className="w-[14px] h-[14px] rounded-sm bg-[var(--color-secondary)]"></div>
                    <div className="w-[14px] h-[14px] rounded-sm bg-green-900/50"></div>
                    <div className="w-[14px] h-[14px] rounded-sm bg-green-700"></div>
                    <div className="w-[14px] h-[14px] rounded-sm bg-green-500"></div>
                    <div className="w-[14px] h-[14px] rounded-sm bg-green-400"></div>
                    <span>More</span>
                  </div>
                </div>
              )}

              {/* Recent Submissions */}
              <div className="rounded-2xl border overflow-hidden flex flex-col h-[400px]" style={cardStyle}>
                <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                  <h3 className="font-semibold flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Recent Accepted Submissions
                  </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {submissions.length > 0 ? (
                    <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                      {submissions.map((sub, i) => {
                        const subSecs = parseInt(sub.timestamp);
                        const isToday = subSecs >= startOfTodaySecs;

                        return (
                          <a
                            key={i}
                            href={`https://leetcode.com/problems/${sub.titleSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 transition-colors hover:bg-[var(--color-secondary)]/50 group"
                          >
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-semibold group-hover:text-yellow-500 transition-colors flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
                                {sub.title}
                                {isToday && <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Today</span>}
                              </span>
                              <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                                {formatRelativeDate(new Date(subSecs * 1000).toISOString())}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-mono px-2 py-1 rounded-md border" style={{ background: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }}>
                                {sub.lang}
                              </span>
                              <ChevronRight className="w-4 h-4 text-[var(--color-muted-foreground)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                      No recent submissions found. Time to solve some problems!
                    </div>
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
