"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Plus, Trophy, Target, Trash2, X, Loader2, TrendingUp, Calendar, Plus as PlusIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { createGoal, deleteGoal, incrementGoal } from "@/actions/goal.actions";
import { calculatePercentage, formatDate } from "@/lib/utils";
import type { IGoal } from "@/types";

interface GoalsClientProps {
  initialGoals: IGoal[];
}

const GOAL_CATEGORIES = [
  { value: "applications", label: "Applications", emoji: "📨" },
  { value: "leetcode", label: "LeetCode", emoji: "🧠" },
  { value: "study", label: "Study Hours", emoji: "📚" },
  { value: "projects", label: "Projects", emoji: "🔨" },
  { value: "networking", label: "Networking", emoji: "🤝" },
  { value: "general", label: "General", emoji: "🎯" },
];

export function GoalsClient({ initialGoals }: GoalsClientProps) {
  const [goals, setGoals] = useState<IGoal[]>(initialGoals);
  const [showForm, setShowForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [incrementingId, setIncrementingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "general",
    targetValue: "",
    unit: "",
    deadline: "",
    dailyTarget: "1",
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEditClick = (goal: IGoal) => {
    setForm({
      title: goal.title,
      description: goal.description || "",
      category: goal.category,
      targetValue: goal.targetValue.toString(),
      unit: goal.unit || "",
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split("T")[0] : "",
      dailyTarget: goal.dailyTarget.toString(),
    });
    setEditingId(goal._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAdd = async () => {
    if (!form.title.trim() || !form.targetValue) return;
    setIsAdding(true);
    try {
      const payload = {
        ...form,
        targetValue: parseInt(form.targetValue),
        dailyTarget: parseInt(form.dailyTarget) || 1,
        deadline: form.deadline ? new Date(form.deadline) : undefined,
      };

      if (editingId) {
        const { updateGoal } = await import("@/actions/goal.actions");
        const result = await updateGoal(editingId, payload);
        if (result.error) { toast.error(result.error); return; }
        
        setGoals((prev) => prev.map((g) => 
          g._id === editingId ? { ...g, ...payload, category: payload.category as IGoal["category"] } : g
        ));
        toast.success("Goal updated!");
      } else {
        const result = await createGoal(payload);
        if (result.error) { toast.error(result.error); return; }

        const newGoal: IGoal = {
          _id: result.id!,
          userId: "",
          title: form.title,
          description: form.description,
          category: form.category,
          targetValue: parseInt(form.targetValue),
          currentValue: 0,
          unit: form.unit,
          deadline: form.deadline ? new Date(form.deadline) : undefined,
          milestones: [],
          dailyTarget: parseInt(form.dailyTarget) || 1,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setGoals((prev) => [newGoal, ...prev]);
        toast.success("Goal created!");
      }
      setForm({ title: "", description: "", category: "general", targetValue: "", unit: "", deadline: "", dailyTarget: "1" });
      setEditingId(null);
      setShowForm(false);
    } finally {
      setIsAdding(false);
    }
  };

  const handleIncrement = async (id: string, amount: number = 1) => {
    setIncrementingId(id);
    setGoals((prev) => prev.map((g) => g._id === id ? { ...g, currentValue: Math.min(g.currentValue + amount, g.targetValue) } : g));
    await incrementGoal(id, amount);
    setIncrementingId(null);
    toast.success("+1 progress logged!");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this goal?")) return;
    setGoals((prev) => prev.filter((g) => g._id !== id));
    await deleteGoal(id);
    toast.success("Goal deleted");
  };

  const inputCls = `px-3 py-2 rounded-xl text-sm outline-none w-full
    bg-[var(--color-secondary)] text-[var(--color-foreground)]
    border border-[var(--color-border)]
    focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/30`;

  const cardStyle = { background: "var(--color-card)", border: "1px solid var(--color-border)" };
  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        description="Set ambitious goals and track progress every day"
        badge={{ label: "active", count: activeGoals.length }}
        actions={
          <button id="add-goal-btn" onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            style={{ background: "linear-gradient(135deg, #F59E0B, #EAB308)" }}>
            <Plus className="w-4 h-4" /> New Goal
          </button>
        }
      />

      {/* Stats banner */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active", value: activeGoals.length, color: "#6366F1" },
          { label: "Completed", value: completedGoals.length, color: "#22C55E" },
          { label: "Total Progress", value: `${activeGoals.length > 0 ? Math.round(activeGoals.reduce((s, g) => s + calculatePercentage(g.currentValue, g.targetValue), 0) / activeGoals.length) : 0}%`, color: "#F59E0B" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4 text-center" style={cardStyle}>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl p-5 overflow-hidden" style={{ ...cardStyle, border: "1px solid var(--color-primary)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>{editingId ? "Edit Goal" : "New Goal"}</h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); setForm({ title: "", description: "", category: "general", targetValue: "", unit: "", deadline: "", dailyTarget: "1" }); }} className="cursor-pointer" style={{ color: "var(--color-muted-foreground)" }}><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="Goal title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={`${inputCls} sm:col-span-2`} autoFocus />
              <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className={`${inputCls} sm:col-span-2 resize-none`} />
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={inputCls}>
                {GOAL_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
              </select>
              <input placeholder="Unit (applications, hours...)" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} className={inputCls} />
              <input placeholder="Target (e.g. 300)" type="number" value={form.targetValue} onChange={(e) => setForm((f) => ({ ...f, targetValue: e.target.value }))} className={inputCls} />
              <input placeholder="Daily target" type="number" value={form.dailyTarget} onChange={(e) => setForm((f) => ({ ...f, dailyTarget: e.target.value }))} className={inputCls} />
              <input type="date" placeholder="Deadline" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} className={`${inputCls} sm:col-span-2`} />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => { setShowForm(false); setEditingId(null); setForm({ title: "", description: "", category: "general", targetValue: "", unit: "", deadline: "", dailyTarget: "1" }); }} className="px-4 py-2 rounded-xl text-sm cursor-pointer" style={{ color: "var(--color-muted-foreground)" }}>Cancel</button>
              <button id="goal-submit" onClick={handleAdd} disabled={isAdding || !form.title || !form.targetValue}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-60 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #F59E0B, #EAB308)" }}>
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editingId ? "Update Goal" : "Create Goal"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Goals */}
      {activeGoals.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-muted-foreground)" }}>Active Goals ({activeGoals.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map((goal) => {
              const pct = calculatePercentage(goal.currentValue, goal.targetValue);
              const cat = GOAL_CATEGORIES.find((c) => c.value === goal.category);
              return (
                <motion.div key={goal._id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-5 group" style={cardStyle}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl">{cat?.emoji || "🎯"}</span>
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate text-sm" style={{ color: "var(--color-foreground)" }}>{goal.title}</h3>
                        {goal.description && <p className="text-xs truncate mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>{goal.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(goal)} className="text-blue-400 p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(goal._id)} className="text-red-400 p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span style={{ color: "var(--color-muted-foreground)" }}>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                      <span className="font-bold" style={{ color: pct === 100 ? "#22C55E" : "var(--color-primary)" }}>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-secondary)" }}>
                      <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: "easeOut" }}
                        style={{ background: pct === 100 ? "#22C55E" : "linear-gradient(90deg, #6366F1, #8B5CF6)" }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                      {goal.deadline && (
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(goal.deadline as unknown as string)}</span>
                      )}
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{goal.dailyTarget}/day target</span>
                    </div>
                    <button
                      onClick={() => handleIncrement(goal._id)}
                      disabled={incrementingId === goal._id || pct === 100}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
                      style={{ background: "var(--color-secondary)", color: "var(--color-primary)" }}
                    >
                      {incrementingId === goal._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusIcon className="w-3.5 h-3.5" />}
                      +1
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState icon={<Trophy className="w-6 h-6 text-yellow-400" />} title="No active goals" description="Set a goal to stay motivated and track progress" action={
          <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-xl text-sm font-medium text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #F59E0B, #EAB308)" }}>Create Your First Goal</button>
        } />
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-muted-foreground)" }}>Completed ({completedGoals.length})</h2>
          {completedGoals.map((goal) => (
            <div key={goal._id} className="flex items-center gap-3 p-4 rounded-2xl opacity-70" style={cardStyle}>
              <Trophy className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <p className="flex-1 text-sm line-through" style={{ color: "var(--color-muted-foreground)" }}>{goal.title}</p>
              <span className="text-xs font-medium text-green-500">✓ {goal.targetValue} {goal.unit}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
