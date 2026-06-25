"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Plus, CheckCircle2, Circle, Trash2, Timer,
  Zap, Target, Loader2, Edit2, X, Check, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Award
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { createTask, toggleTask, deleteTask, updateTask } from "@/actions/task.actions";
import { TASK_CATEGORIES, PRIORITIES } from "@/lib/constants";
import { calculatePercentage } from "@/lib/utils";
import type { ITask } from "@/types";
import { 
  format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, 
  isBefore, startOfDay, isToday, getDay, addMonths, subMonths, startOfWeek, endOfWeek
} from "date-fns";

interface TodayClientProps {
  initialTasks: ITask[];
  initialDate?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  leetcode: "#F59E0B",
  application: "#3B82F6",
  "cold-mail": "#06B6D4",
  study: "#8B5CF6",
  project: "#10B981",
  interview: "#EC4899",
  networking: "#06B6D4",
  other: "#6B7280",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "#6B7280",
  medium: "#F59E0B",
  high: "#F97316",
  critical: "#EF4444",
};

export function TodayClient({ initialTasks, initialDate }: TodayClientProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<ITask[]>(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  
  const selectedDate = initialDate ? new Date(initialDate) : new Date();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const [form, setForm] = useState({
    title: "",
    category: "other",
    priority: "medium",
    timeEstimate: "",
    points: "5",
  });

  const completed = tasks.filter((t) => t.completed);
  const pending = tasks.filter((t) => !t.completed);
  const dailyTargetTasks = pending.filter((t) => (t as ITask & { isDailyTarget?: boolean }).isDailyTarget);
  const otherPending = pending.filter((t) => !(t as ITask & { isDailyTarget?: boolean }).isDailyTarget);
  const totalScore = completed.reduce((s, t) => s + t.points, 0);
  const progress = calculatePercentage(completed.length, tasks.length);

  const handleDateChange = (date: Date) => {
    router.push(`/today?date=${format(date, "yyyy-MM-dd")}`);
  };

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    setIsAdding(true);
    try {
      const result = await createTask({
        title: form.title,
        category: form.category,
        priority: form.priority,
        timeEstimate: form.timeEstimate ? parseInt(form.timeEstimate) : undefined,
        points: parseInt(form.points) || 5,
        date: selectedDate,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        const newTask: ITask = {
          _id: result.id || Date.now().toString(),
          userId: "",
          title: form.title,
          category: form.category as ITask["category"],
          priority: form.priority as ITask["priority"],
          timeEstimate: form.timeEstimate ? parseInt(form.timeEstimate) : undefined,
          timeSpent: 0,
          points: parseInt(form.points) || 5,
          completed: false,
          date: selectedDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setTasks((prev) => [...prev, newTask]);
        setForm({ title: "", category: "other", priority: "medium", timeEstimate: "", points: "5" });
        setShowForm(false);
        toast.success("Task added!");
      }
    } catch {
      toast.error("Failed to add task");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (task: ITask) => {
    setTogglingId(task._id);
    const newCompleted = !task.completed;

    setTasks((prev) =>
      prev.map((t) =>
        t._id === task._id ? { ...t, completed: newCompleted } : t
      )
    );

    try {
      const result = await toggleTask(task._id, newCompleted);
      if (result.error) {
        setTasks((prev) =>
          prev.map((t) =>
            t._id === task._id ? { ...t, completed: !newCompleted } : t
          )
        );
        toast.error("Failed to update task");
      } else {
        if (newCompleted && isToday(selectedDate)) {
          toast.success(`+${task.points} pts! 🎯`);
        } else if (newCompleted) {
           toast.success("Task marked complete!");
        }
      }
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t._id !== id));
    const result = await deleteTask(id);
    if (result.error) toast.error("Failed to delete task");
  };

  const handleUpdate = async (id: string, updates: Partial<ITask>) => {
    setTasks((prev) => prev.map((t) => t._id === id ? { ...t, ...updates } : t));
    const result = await updateTask(id, updates);
    if (result.error) {
      toast.error("Failed to update task");
    } else {
      toast.success("Task updated");
    }
  };

  const inputClass = `px-3 py-2 rounded-xl text-sm outline-none transition-all w-full
    bg-[var(--color-secondary)] text-[var(--color-foreground)]
    border border-[var(--color-border)]
    focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/30`;

  // Calendar logic
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title={isToday(selectedDate) ? "Today's Mission" : `Mission for ${format(selectedDate, "MMM do")}`}
        description="Plan your daily tasks and hit your goals."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Calendar & Stats */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          
          {/* Calendar Widget */}
          <div className="rounded-2xl p-5 border" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
                <CalendarIcon className="w-5 h-5 text-indigo-400" /> Planner
              </h3>
              <div className="flex gap-1">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-[var(--color-secondary)] rounded-md transition-colors cursor-pointer" style={{ color: "var(--color-muted-foreground)" }}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold px-2 py-1" style={{ color: "var(--color-foreground)" }}>
                  {format(currentMonth, "MMMM yyyy")}
                </span>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-[var(--color-secondary)] rounded-md transition-colors cursor-pointer" style={{ color: "var(--color-muted-foreground)" }}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-[10px] font-bold uppercase" style={{ color: "var(--color-muted-foreground)" }}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const isPastDate = isBefore(startOfDay(day), startOfDay(new Date()));

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => {
                      handleDateChange(day);
                      if (!isCurrentMonth) setCurrentMonth(startOfMonth(day));
                    }}
                    className={`h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all relative cursor-pointer ${
                      isSelected ? "shadow-md scale-105 z-10" : "hover:bg-[var(--color-secondary)]"
                    }`}
                    style={{
                      background: isSelected ? "linear-gradient(135deg, #6366F1, #8B5CF6)" : "transparent",
                      color: isSelected ? "white" : isPastDate ? "var(--color-muted-foreground)" : "var(--color-foreground)",
                      opacity: isCurrentMonth ? 1 : 0.3,
                    }}
                  >
                    {format(day, "d")}
                    {isTodayDate && !isSelected && (
                      <div className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Score Summary */}
          {isToday(selectedDate) && (
            <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1e1b4b, #1a1040)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
              <div className="flex items-center gap-5 relative z-10">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                    <circle
                      cx="40" cy="40" r="34" fill="none" stroke="url(#todayGrad)" strokeWidth="8"
                      strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
                      style={{ transition: "stroke-dashoffset 0.5s ease" }}
                    />
                    <defs>
                      <linearGradient id="todayGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#818CF8" />
                        <stop offset="100%" stopColor="#C084FC" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-white text-lg font-bold">{progress}%</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-bold text-xl">{totalScore} pts</span>
                  </div>
                  <p className="text-indigo-200 text-xs font-medium">
                    {completed.length} of {tasks.length} tasks completed
                  </p>
                </div>
              </div>
              {tasks.length > 0 && completed.length === tasks.length && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-2 relative z-10">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 text-xs font-bold">Perfect Day! +20 Bonus Points</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Tasks Area */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
              <Target className="w-6 h-6 text-indigo-500" />
              {isToday(selectedDate) ? "Today's Roadmap" : `Roadmap for ${format(selectedDate, "MMM do")}`}
            </h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-2xl p-5 border"
                style={{ background: "var(--color-card)", borderColor: "var(--color-primary)" }}
              >
                <h3 className="text-sm font-bold mb-4" style={{ color: "var(--color-foreground)" }}>Quick Add Task</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="E.g., Complete 2 LeetCode Mediums..."
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    className={inputClass}
                    autoFocus
                  />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={inputClass}>
                      {TASK_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className={inputClass}>
                      {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                    <input type="number" placeholder="Est. Mins" value={form.timeEstimate} onChange={(e) => setForm((f) => ({ ...f, timeEstimate: e.target.value }))} className={inputClass} min="1" />
                    <input type="number" placeholder="Points" value={form.points} onChange={(e) => setForm((f) => ({ ...f, points: e.target.value }))} className={inputClass} min="1" max="50" />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm transition-colors hover:bg-[var(--color-secondary)] cursor-pointer" style={{ color: "var(--color-muted-foreground)" }}>Cancel</button>
                    <button onClick={handleAdd} disabled={isAdding || !form.title.trim()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-all cursor-pointer" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
                      {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Save Task
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            {dailyTargetTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
                    Daily Targets
                  </h3>
                  <div className="flex-1 h-px opacity-50" style={{ background: "var(--color-border)" }} />
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    {dailyTargetTasks.filter((t) => t.completed).length}/{dailyTargetTasks.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {dailyTargetTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onUpdate={handleUpdate}
                      isToggling={togglingId === task._id}
                      highlight
                    />
                  ))}
                </div>
              </div>
            )}

            {otherPending.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-muted-foreground)" }}>Pending</h3>
                  <div className="flex-1 h-px bg-border opacity-50"></div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">{otherPending.length}</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <AnimatePresence>
                    {otherPending.map((task) => (
                      <TaskCard key={task._id} task={task} onToggle={handleToggle} onDelete={handleDelete} onUpdate={handleUpdate} isToggling={togglingId === task._id} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-muted-foreground)" }}>Completed</h3>
                  <div className="flex-1 h-px bg-border opacity-50"></div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">{completed.length}</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <AnimatePresence>
                    {completed.map((task) => (
                      <TaskCard key={task._id} task={task} onToggle={handleToggle} onDelete={handleDelete} onUpdate={handleUpdate} isToggling={togglingId === task._id} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {tasks.length === 0 && (
              <div className="text-center py-20 rounded-2xl border border-dashed" style={{ borderColor: "var(--color-border)" }}>
                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 opacity-50" style={{ color: "var(--color-primary)" }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--color-foreground)" }}>No tasks for {format(selectedDate, "MMM do")}</h3>
                <p className="text-sm max-w-sm mx-auto mb-6" style={{ color: "var(--color-muted-foreground)" }}>
                  Plan ahead to hit your career goals faster.
                </p>
                <button onClick={() => setShowForm(true)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
                  Create First Task
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, onToggle, onDelete, onUpdate, isToggling, highlight = false }: { task: ITask; onToggle: (task: ITask) => void; onDelete: (id: string) => void; onUpdate: (id: string, updates: Partial<ITask>) => void; isToggling: boolean; highlight?: boolean; }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const catColor = CATEGORY_COLORS[task.category] || "#6B7280";
  const prioColor = PRIORITY_COLORS[task.priority] || "#6B7280";

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      onUpdate(task._id, { title: editTitle });
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, height: 0 }}
      className={`group flex items-stretch gap-4 p-4 rounded-2xl transition-all border shadow-sm hover:shadow-md ${task.completed ? "opacity-60 bg-secondary/30" : "bg-card"} ${highlight && !task.completed ? "ring-1 ring-[var(--color-primary)]/25" : ""}`}
      style={{
        background: highlight && !task.completed ? "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))" : "var(--color-card)",
        borderColor: highlight && !task.completed ? "rgba(99,102,241,0.25)" : "var(--color-border)",
      }}
    >
      <div className="flex flex-col items-center justify-start pt-1">
        <button
          onClick={() => onToggle(task)}
          disabled={isToggling}
          className="flex-shrink-0 transition-transform hover:scale-110 focus:outline-none cursor-pointer"
        >
          {isToggling ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : task.completed ? <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-500/20" /> : <Circle className="w-6 h-6 text-muted-foreground hover:text-indigo-400 transition-colors" />}
        </button>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {isEditing ? (
          <div className="flex items-center w-full gap-2 mb-2">
            <input 
              type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="flex-1 bg-transparent border-b-2 border-indigo-500 outline-none text-base font-bold px-1 py-1"
              style={{ color: "var(--color-foreground)" }} autoFocus
            />
            <button onClick={handleSave} className="text-emerald-500 hover:bg-emerald-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"><Check className="w-4 h-4" /></button>
            <button onClick={() => { setIsEditing(false); setEditTitle(task.title); }} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <p className={`text-base font-bold mb-1.5 ${task.completed ? "line-through text-muted-foreground" : ""}`} style={{ color: task.completed ? "var(--color-muted-foreground)" : "var(--color-foreground)" }}>
            {task.title}
          </p>
        )}
        
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide border" style={{ color: catColor, borderColor: `${catColor}30`, background: `${catColor}10` }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: catColor }} /> {task.category}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide border" style={{ color: prioColor, borderColor: `${prioColor}30`, background: `${prioColor}10` }}>
            {task.priority}
          </span>
          {task.timeEstimate && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-secondary/50 text-muted-foreground border-border">
              <Timer className="w-3 h-3" /> {task.timeEstimate}m
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${task.completed ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-secondary text-muted-foreground border-border"}`}>
            +{task.points} pts
          </span>
        </div>
      </div>

      {!isEditing && (
        <div className="flex flex-col items-end justify-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setIsEditing(true)} className="p-2 rounded-xl hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-400 transition-colors cursor-pointer">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(task._id)} className="p-2 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
