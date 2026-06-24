"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Send, Mail, Loader2, Save, Minus, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  getDailyTargets,
  upsertCategoryTarget,
  getDailyTargetProgress,
  updateDailyTargets,
} from "@/actions/daily-target.actions";
import {
  DAILY_TARGET_CATEGORIES,
  DAILY_TARGET_META,
  type DailyTargetCategory,
} from "@/lib/dailyTargetConfig";
import { buildTargetItem } from "@/lib/dailyTargetConfig";
import { useDailyTargetStore } from "@/stores/useDailyTargetStore";

const CATEGORY_ICONS = {
  application: Send,
  "cold-mail": Mail,
  todo: CheckCircle2,
} as const;

export function DailyTargetPanel() {
  const router = useRouter();
  const { isOpen, activeCategory, close, setActiveCategory } =
    useDailyTargetStore();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [targets, setTargets] = useState<Record<DailyTargetCategory, number>>({
    application: 0,
    "cold-mail": 0,
    todo: 0,
  });
  const [customTargets, setCustomTargets] = useState<{
    _id?: string;
    title: string;
    category: string;
    points: number;
  }[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newPoints, setNewPoints] = useState<number>(5);
  const [progress, setProgress] = useState<
    Record<DailyTargetCategory, { count: number; target: number | null }>
  >({
    application: { count: 0, target: null },
    "cold-mail": { count: 0, target: null },
    todo: { count: 0, target: null },
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [data, prog] = await Promise.all([
        getDailyTargets(),
        getDailyTargetProgress(),
      ]);

      const nextTargets: Record<DailyTargetCategory, number> = {
        application: 0,
        "cold-mail": 0,
        todo: 0,
      };

      for (const cat of DAILY_TARGET_CATEGORIES) {
        const found = data?.targets?.find(
          (t: { category: string; points: number }) => t.category === cat
        );
        nextTargets[cat] = found ? Number(found.points) || 0 : 0;
      }

      setTargets(nextTargets);
      // custom targets: only those with category === 'todo'
      // exclude aggregate built todo targets like "Complete 5 todos"
      const AGGREGATE_TODO_RE = /^Complete\s+\d+\s+todos?$/i;
      const customs = (data?.targets || []).filter((t: any) => t.category === 'todo' && !AGGREGATE_TODO_RE.test(String(t.title || '')));
      setCustomTargets(customs);
      setProgress(prog);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) loadData();
  }, [isOpen, loadData]);

  const adjustCount = (category: DailyTargetCategory, delta: number) => {
    setTargets((prev) => ({
      ...prev,
      [category]: Math.max(0, Math.min(50, prev[category] + delta)),
    }));
  };

  const handleSaveCategory = async (category: DailyTargetCategory) => {
    if (category === 'todo') {
      // Save custom todos only
      const final: { title: string; category: string; points: number; _id?: string }[] = [];
      for (const cat of DAILY_TARGET_CATEGORIES) {
        if (targets[cat] > 0) final.push(buildTargetItem(cat, targets[cat]));
      }
      for (const ct of customTargets) final.push({ title: ct.title, category: ct.category, points: ct.points, _id: ct._id });

      setSaving(true);
      const res = await updateDailyTargets(final);
      setSaving(false);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Todos saved — check Today\'s Mission');
      await loadData();
      router.refresh();
      return;
    }

    const count = targets[category];
    if (count <= 0) {
      toast.error(`Set a target of at least 1 ${DAILY_TARGET_META[category].shortLabel.toLowerCase()}`);
      return;
    }

    setSaving(true);
    const result = await upsertCategoryTarget(category, count);
    setSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(`${DAILY_TARGET_META[category].shortLabel} target saved — check Today's Mission`);
    await loadData();
    router.refresh();
  };

  const handleSaveAll = async () => {
    // Build final targets array: core category targets + custom targets
    const final: { title: string; category: string; points: number; _id?: string }[] = [];
    for (const cat of DAILY_TARGET_CATEGORIES) {
      if (targets[cat] > 0) {
        final.push(buildTargetItem(cat, targets[cat]));
      }
    }

    // include any custom targets from state
    for (const ct of customTargets) {
      final.push({ title: ct.title, category: ct.category, points: ct.points, _id: ct._id });
    }

    if (final.length === 0) {
      toast.error("Set at least one target before saving");
      return;
    }

    setSaving(true);
    const res = await updateDailyTargets(final);
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Daily targets saved!");
    await loadData();
    router.refresh();
    close();
  };

  const activeMeta = DAILY_TARGET_META[activeCategory];
  const ActiveIcon = CATEGORY_ICONS[activeCategory as keyof typeof CATEGORY_ICONS];
  const activeProgress = progress[activeCategory as DailyTargetCategory];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Daily targets"
        >
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm cursor-pointer"
            aria-label="Close daily targets"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="px-6 pt-6 pb-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(6,182,212,0.08) 100%)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2.5 rounded-2xl"
                    style={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <Target className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h2
                      className="text-lg font-bold"
                      style={{ color: "var(--color-foreground)" }}
                    >
                      Daily Targets
                    </h2>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      Synced across dashboard, pages & Today&apos;s Mission
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="p-2 rounded-xl hover:bg-[var(--color-secondary)] transition-colors cursor-pointer"
                  style={{ color: "var(--color-muted-foreground)" }}
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2 mt-5">
                {DAILY_TARGET_CATEGORIES.map((cat) => {
                  const meta = DAILY_TARGET_META[cat];
                  const Icon = CATEGORY_ICONS[cat];
                  const isActive = activeCategory === cat;
                  const catProgress = progress[cat];
                  const done =
                    catProgress.target !== null &&
                    catProgress.target > 0 &&
                    catProgress.count >= catProgress.target;

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                      style={{
                        background: isActive ? meta.gradient : "var(--color-card)",
                        color: isActive ? "#fff" : "var(--color-foreground)",
                        border: isActive
                          ? "1px solid transparent"
                          : "1px solid var(--color-border)",
                        boxShadow: isActive
                          ? "0 4px 14px rgba(99,102,241,0.25)"
                          : "none",
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {meta.shortLabel}
                      {done && (
                        <CheckCircle2 className="w-3.5 h-3.5 ml-0.5 opacity-90" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-7 h-7 animate-spin text-[var(--color-primary)]" />
                </div>
              ) : (
                <>
                  <div
                    className="rounded-2xl p-5 mb-5 min-h-[260px] flex flex-col"
                    style={{
                      background: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                      {activeCategory !== 'todo' ? (
                        <>
                          <div className="flex-1 flex flex-col justify-between">
                            <div className="flex items-center gap-3 mb-3">
                              <div
                                className="p-3 rounded-2xl flex items-center justify-center"
                                style={{ background: activeMeta.gradient, width: 48, height: 48 }}
                              >
                                <ActiveIcon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
                                  {activeMeta.label}
                                </p>
                                <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                                  Simple, focused targets for your day
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-center justify-center gap-4">
                              <div className="flex items-center gap-4">
                                <button
                                  type="button"
                                  onClick={() => adjustCount(activeCategory, -1)}
                                  disabled={targets[activeCategory] <= 0}
                                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                                  style={{ border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
                                  aria-label="Decrease target"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>

                                <div className="text-center">
                                  <span className="text-3xl font-extrabold tabular-nums" style={{ color: activeMeta.color }}>{targets[activeCategory]}</span>
                                  <div className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>per day</div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => adjustCount(activeCategory, 1)}
                                  disabled={targets[activeCategory] >= 50}
                                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                                  style={{ border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
                                  aria-label="Increase target"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>

                              <input type="range" min={0} max={30} value={targets[activeCategory]} onChange={(e) => setTargets((prev) => ({ ...prev, [activeCategory]: parseInt(e.target.value, 10) }))} className="w-full mt-2" />

                              {activeProgress.target !== null && activeProgress.target > 0 && (
                                <div className="w-full mt-2">
                                  <div className="flex items-center justify-between text-xs mb-2">
                                    <span style={{ color: "var(--color-muted-foreground)" }}>Today's progress</span>
                                    <span className="font-semibold" style={{ color: activeProgress.count >= activeProgress.target ? "var(--color-success)" : "var(--color-foreground)" }}>{activeProgress.count}/{activeProgress.target}</span>
                                  </div>
                                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-secondary)" }}>
                                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (activeProgress.count / activeProgress.target) * 100)}%`, background: activeMeta.gradient }} />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Todo title" className="flex-1 px-3 py-2 rounded-xl" style={{ background: '#ffffff', border: '1px solid #ffffff', color: '#000000' }} />
                              <input type="number" value={newPoints} onChange={(e) => setNewPoints(Number(e.target.value))} className="w-24 px-3 py-2 rounded-xl" style={{ background: '#ffffff', border: '1px solid #ffffff', color: '#000000' }} />
                              <button onClick={() => {
                                if (!newTitle.trim()) { toast.error('Enter a title'); return; }
                                const localId = '_local_' + Date.now() + '_' + Math.random().toString(36).slice(2);
                                setCustomTargets((s) => [...s, { _id: localId, title: newTitle.trim(), category: 'todo', points: newPoints }]);
                                setNewTitle('');
                                setNewPoints(5);
                              }} className="px-4 py-2 rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #06B6D4, #3B82F6)' }}>Add</button>
                            </div>

                            <div className="space-y-2 overflow-y-auto overflow-x-hidden max-h-[200px]">
                              {customTargets.map((ct) => (
                                <div key={ct._id || ct.title} className="flex items-center justify-between gap-2 p-2 rounded-lg" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
                                  <div>
                                    <div className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>{ct.title}</div>
                                    <div className="text-xs text-muted-foreground">{ct.points} pts</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button onClick={async () => {
                                      // remove from local state
                                      setCustomTargets((s) => s.filter((t) => t._id !== ct._id));
                                    }} className="px-3 py-1 rounded-lg text-sm" style={{ border: '1px solid var(--color-border)' }}>Delete</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveCategory(activeCategory)}
                      disabled={saving || targets[activeCategory] <= 0}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-transform active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
                      style={{ background: activeMeta.gradient }}
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save {activeMeta.shortLabel}
                    </button>
                  </div>
                  
                </>
              )}
            </div>

            <div
              className="px-6 py-4 flex items-center justify-between gap-3"
              style={{
                borderTop: "1px solid var(--color-border)",
                background: "var(--color-background)",
              }}
            >
              <button
                type="button"
                onClick={close}
                className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-secondary)] transition-colors cursor-pointer"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={saving || loading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-transform active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                }}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save All
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
