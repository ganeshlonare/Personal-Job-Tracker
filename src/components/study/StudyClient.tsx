"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Play, Pause, Square, Plus, BookOpen, X, Trash2, Clock, Timer, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { createStudySession, deleteStudySession } from "@/actions/study.actions";
import { STUDY_SUBJECTS } from "@/lib/constants";
import { formatRelativeDate } from "@/lib/utils";
import type { IStudySession } from "@/types";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface StudyClientProps {
  initialSessions: IStudySession[];
  stats: { todayMinutes: number; todayPomodoros: number; weekMinutes: number; monthMinutes: number; subjectBreakdown: { subject: string; minutes: number; sessions: number }[] };
}

const POMODORO_MINUTES = 25;

export function StudyClient({ initialSessions, stats }: StudyClientProps) {
  const [sessions, setSessions] = useState<IStudySession[]>(initialSessions);
  const [showForm, setShowForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Pomodoro timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(POMODORO_MINUTES * 60);
  const [pomodoroSubject, setPomodoroSubject] = useState("dsa");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [form, setForm] = useState({
    subject: "dsa",
    topic: "",
    duration: "",
    type: "study",
    notes: "",
    pomodoroCount: "0",
  });

  useEffect(() => {
    // Restore from localStorage on mount
    const savedStateStr = localStorage.getItem("jobos_study_timer");
    if (savedStateStr) {
      try {
        const savedState = JSON.parse(savedStateStr);
        if (savedState.timerRunning && savedState.lastTick) {
          const now = Date.now();
          const diffSeconds = Math.floor((now - savedState.lastTick) / 1000);
          
          if (savedState.timeLeft - diffSeconds > 0) {
            setTimeLeft(savedState.timeLeft - diffSeconds);
            setElapsedSeconds(savedState.elapsedSeconds + diffSeconds);
            setTimerRunning(true);
            setPomodoroSubject(savedState.pomodoroSubject || "dsa");
          } else {
            // Timer expired while away
            setElapsedSeconds(savedState.elapsedSeconds + savedState.timeLeft);
            setTimeLeft(POMODORO_MINUTES * 60);
            setTimerRunning(false);
          }
        } else {
          setTimeLeft(savedState.timeLeft);
          setElapsedSeconds(savedState.elapsedSeconds);
          setPomodoroSubject(savedState.pomodoroSubject || "dsa");
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setTimerRunning(false);
            
            // Auto-log the pomodoro directly
            const autoLog = async () => {
              const minutes = POMODORO_MINUTES;
              const result = await createStudySession({
                subject: pomodoroSubject,
                duration: minutes,
                pomodoroCount: 1,
                type: "study",
                date: new Date(),
              });
              
              if (result.success) {
                toast.success("🍅 Pomodoro complete & logged! Take a 5-min break.");
                // Reload page to reflect changes in stats
                window.location.reload();
              }
            };
            autoLog();
            
            localStorage.removeItem("jobos_study_timer");
            setElapsedSeconds(0);
            return POMODORO_MINUTES * 60;
          }
          return t - 1;
        });
        setElapsedSeconds((e) => e + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning, pomodoroSubject]);

  useEffect(() => {
    // Save state to localStorage whenever it changes
    if (timerRunning || elapsedSeconds > 0) {
      localStorage.setItem("jobos_study_timer", JSON.stringify({
        timerRunning,
        timeLeft,
        elapsedSeconds,
        pomodoroSubject,
        lastTick: Date.now(),
      }));
    } else {
      localStorage.removeItem("jobos_study_timer");
    }
  }, [timerRunning, timeLeft, elapsedSeconds, pomodoroSubject]);

  const handleStopTimer = async () => {
    setTimerRunning(false);
    if (elapsedSeconds < 60) { toast.error("Study at least 1 minute to log"); return; }

    const minutes = Math.floor(elapsedSeconds / 60);
    const result = await createStudySession({
      subject: pomodoroSubject,
      duration: minutes,
      pomodoroCount: Math.floor(elapsedSeconds / (POMODORO_MINUTES * 60)),
      type: "study",
      date: new Date(),
    });

    if (result.success) {
      const newSession: IStudySession = {
        _id: result.id!,
        userId: "",
        subject: pomodoroSubject,
        duration: minutes,
        pomodoroCount: Math.floor(elapsedSeconds / (POMODORO_MINUTES * 60)),
        type: "study",
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setSessions((prev) => [newSession, ...prev]);
      toast.success(`📚 ${minutes}m logged! +${Math.round((minutes / 60) * 8)} pts`);
    }

    setElapsedSeconds(0);
    setTimeLeft(POMODORO_MINUTES * 60);
  };

  const handleManualAdd = async () => {
    if (!form.duration) return;
    setIsAdding(true);
    try {
      const result = await createStudySession({
        ...form,
        duration: parseInt(form.duration),
        pomodoroCount: parseInt(form.pomodoroCount) || 0,
        date: new Date(),
      });

      if (result.error) { toast.error(result.error); return; }

      const newSession: IStudySession = {
        _id: result.id!,
        userId: "",
        subject: form.subject,
        topic: form.topic,
        duration: parseInt(form.duration),
        pomodoroCount: parseInt(form.pomodoroCount) || 0,
        type: form.type as IStudySession["type"],
        notes: form.notes,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setSessions((prev) => [newSession, ...prev]);
      setForm({ subject: "dsa", topic: "", duration: "", type: "study", notes: "", pomodoroCount: "0" });
      setShowForm(false);
      toast.success(`📚 Session logged! +${Math.round((parseInt(form.duration) / 60) * 8)} pts`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSessions((prev) => prev.filter((s) => s._id !== id));
    await deleteStudySession(id);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const cardStyle = { background: "var(--color-card)", border: "1px solid var(--color-border)" };
  const inputCls = `px-3 py-2 rounded-xl text-sm outline-none w-full bg-[var(--color-secondary)] text-[var(--color-foreground)] border border-[var(--color-border)] focus:border-[var(--color-primary)]`;

  const subjectColors = ["#6366F1", "#8B5CF6", "#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#06B6D4", "#EF4444"];

  const pieData = stats.subjectBreakdown.map((s) => ({
    name: STUDY_SUBJECTS.find((sub) => sub.value === s.subject)?.label || s.subject,
    value: s.minutes,
  }));

  const formatStudyTime = (mins: number) => {
    if (mins < 60) return `${Math.round(mins)}m`;
    return `${Math.floor(mins / 60)}h ${Math.round(mins % 60)}m`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Tracker"
        description="Track study sessions and Pomodoro progress"
        actions={
          <button id="log-study-btn" onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1)" }}>
            <Plus className="w-4 h-4" /> Log Session
          </button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Today", value: formatStudyTime(stats.todayMinutes), color: "#6366F1" },
          { label: "This Week", value: formatStudyTime(stats.weekMinutes), color: "#8B5CF6" },
          { label: "This Month", value: formatStudyTime(stats.monthMinutes), color: "#EC4899" },
          { label: "Pomodoros", value: stats.todayPomodoros, color: "#EF4444" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4 text-center" style={cardStyle}>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pomodoro Timer */}
        <div className="rounded-2xl p-6 text-center" style={{ ...cardStyle, background: "linear-gradient(135deg, #1e1b4b, #1a1040)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <h3 className="text-indigo-300 text-sm font-medium mb-4">Pomodoro Timer</h3>

          <select value={pomodoroSubject} onChange={(e) => setPomodoroSubject(e.target.value)}
            className="mb-6 px-3 py-2 rounded-xl text-sm outline-none text-white bg-white/10 border border-white/20 w-full">
            {STUDY_SUBJECTS.map((s) => <option key={s.value} value={s.value} style={{ background: "#1e1b4b" }}>{s.label}</option>)}
          </select>

          {/* Circle timer */}
          <div className="relative w-36 h-36 mx-auto mb-6">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 144 144">
              <circle cx="72" cy="72" r="62" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
              <circle cx="72" cy="72" r="62" fill="none" stroke="#818CF8" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 62}`}
                strokeDashoffset={`${2 * Math.PI * 62 * (timeLeft / (POMODORO_MINUTES * 60))}`}
                style={{ transition: "stroke-dashoffset 1s linear" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{formatTime(timeLeft)}</span>
              <span className="text-indigo-300 text-xs mt-1">remaining</span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button onClick={() => setTimerRunning(!timerRunning)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer"
              style={{ background: timerRunning ? "#F59E0B" : "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
              {timerRunning ? <><Pause className="w-4 h-4" />Pause</> : <><Play className="w-4 h-4" />Start</>}
            </button>
            {(timerRunning || elapsedSeconds > 0) && (
              <button onClick={handleStopTimer} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500/80 transition-all cursor-pointer">
                <Square className="w-4 h-4" /> Stop & Log
              </button>
            )}
          </div>

          {elapsedSeconds > 0 && (
            <p className="text-indigo-300 text-xs mt-3">Elapsed: {formatTime(elapsedSeconds)}</p>
          )}
        </div>

        {/* Subject Breakdown Chart */}
        {pieData.length > 0 ? (
          <div className="rounded-2xl p-5" style={cardStyle}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Subject Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={subjectColors[i % subjectColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "12px", color: "var(--color-foreground)" }} formatter={(v) => [`${v}m`, ""]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", color: "var(--color-muted-foreground)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="rounded-2xl p-5 flex items-center justify-center" style={cardStyle}>
            <EmptyState icon={<BookOpen className="w-6 h-6 text-purple-400" />} title="No data yet" description="Log sessions to see your breakdown" />
          </div>
        )}
      </div>

      {/* Manual Log Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl p-5 overflow-hidden" style={{ ...cardStyle, border: "1px solid var(--color-primary)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>Log Study Session</h3>
              <button onClick={() => setShowForm(false)} className="cursor-pointer" style={{ color: "var(--color-muted-foreground)" }}><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className={inputCls}>
                {STUDY_SUBJECTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <input placeholder="Topic" value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} className={inputCls} />
              <input placeholder="Duration (minutes) *" type="number" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} className={inputCls} />
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className={inputCls}>
                <option value="study">Study</option>
                <option value="revision">Revision</option>
                <option value="practice">Practice</option>
              </select>
              <input placeholder="Pomodoros" type="number" value={form.pomodoroCount} onChange={(e) => setForm((f) => ({ ...f, pomodoroCount: e.target.value }))} className={inputCls} />
              <textarea placeholder="Notes..." value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={1} className={`${inputCls} sm:col-span-3 resize-none`} />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm cursor-pointer" style={{ color: "var(--color-muted-foreground)" }}>Cancel</button>
              <button id="study-submit" onClick={handleManualAdd} disabled={isAdding || !form.duration}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-60 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1)" }}>
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Log Session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session History */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-muted-foreground)" }}>Recent Sessions</h2>
        {sessions.length === 0 ? (
          <EmptyState icon={<BookOpen className="w-6 h-6 text-purple-400" />} title="No sessions yet" description="Start a Pomodoro or log a manual session" />
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 20).map((s) => {
              const subjectInfo = STUDY_SUBJECTS.find((sub) => sub.value === s.subject);
              return (
                <div key={s._id} className="flex items-center gap-3 p-3.5 rounded-xl group" style={cardStyle}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${subjectInfo?.color || "#6366F1"}20` }}>
                    <BookOpen className="w-4 h-4" style={{ color: subjectInfo?.color || "#6366F1" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>{subjectInfo?.label || s.subject}</p>
                    <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{s.topic || s.type} · {formatRelativeDate(s.date as unknown as string)}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.duration}m</span>
                    {s.pomodoroCount > 0 && <span className="flex items-center gap-1"><Timer className="w-3 h-3" />🍅{s.pomodoroCount}</span>}
                  </div>
                  <button onClick={() => handleDelete(s._id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
