"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { PenLine, Save, Loader2, Calendar, Smile, Meh, Frown, Sparkles, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { upsertJournal } from "@/actions/journal.actions";
import { formatDate } from "@/lib/utils";
import type { IJournal } from "@/types";

interface JournalClientProps {
  initialJournals: IJournal[];
  initialToday: IJournal | null;
}

const MOODS = [
  { value: "excellent", label: "Excellent", icon: Sparkles, color: "#10B981" },
  { value: "good", label: "Good", icon: Smile, color: "#3B82F6" },
  { value: "neutral", label: "Neutral", icon: Meh, color: "#F59E0B" },
  { value: "bad", label: "Bad", icon: Frown, color: "#EF4444" },
];

export function JournalClient({ initialJournals, initialToday }: JournalClientProps) {
  const [journals, setJournals] = useState<IJournal[]>(initialJournals);
  const [todayJournal, setTodayJournal] = useState<IJournal | null>(initialToday);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    mood: initialToday?.mood || "good",
    entry: initialToday?.entry || "",
    wins: initialToday?.wins.join("\n") || "",
    challenges: initialToday?.challenges.join("\n") || "",
    gratitude: initialToday?.gratitude.join("\n") || "",
  });

  const handleSave = async () => {
    if (!form.entry.trim()) return;
    setIsSaving(true);
    try {
      const result = await upsertJournal({
        mood: form.mood,
        entry: form.entry,
        wins: form.wins.split("\n").filter(Boolean),
        challenges: form.challenges.split("\n").filter(Boolean),
        gratitude: form.gratitude.split("\n").filter(Boolean),
        date: new Date(),
      });

      if (result.error) { toast.error(result.error); return; }

      const updatedData = {
        _id: result.id!, userId: "", mood: form.mood as IJournal["mood"],
        entry: form.entry, wins: form.wins.split("\n").filter(Boolean),
        challenges: form.challenges.split("\n").filter(Boolean),
        gratitude: form.gratitude.split("\n").filter(Boolean),
        date: new Date(), createdAt: new Date(), updatedAt: new Date()
      };

      setTodayJournal(updatedData);
      
      // Update in history list
      setJournals((prev) => {
        const exists = prev.some(j => j._id === result.id);
        if (exists) return prev.map(j => j._id === result.id ? updatedData : j);
        return [updatedData, ...prev];
      });

      toast.success("Journal saved!");
    } finally { setIsSaving(false); }
  };

  const cardStyle = { background: "var(--color-card)", border: "1px solid var(--color-border)" };
  const inputCls = `w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none bg-[var(--color-secondary)] text-[var(--color-foreground)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/30`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Journal"
        description="Reflect on your progress and maintain your mental well-being"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Entry Form */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
              <PenLine className="w-5 h-5 text-cyan-500" /> Today's Entry
            </h2>
            <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ background: "var(--color-secondary)", color: "var(--color-muted-foreground)" }}>
              {formatDate(new Date())}
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-foreground)" }}>How are you feeling?</label>
              <div className="flex gap-2">
                {MOODS.map((m) => {
                  const Icon = m.icon;
                  const isSelected = form.mood === m.value;
                  return (
                    <button key={m.value} onClick={() => setForm((f) => ({ ...f, mood: m.value }))}
                      className={`flex-1 flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all cursor-pointer ${isSelected ? "ring-2" : "hover:bg-[var(--color-secondary)]"}`}
                      style={{ 
                        background: isSelected ? `${m.color}15` : "var(--color-card)",
                        border: "1px solid",
                        borderColor: isSelected ? m.color : "var(--color-border)",
                        color: isSelected ? m.color : "var(--color-muted-foreground)" as any,
                        "--tw-ring-color": m.color
                      } as React.CSSProperties}>
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-medium">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-foreground)" }}>Brain Dump (What's on your mind?)</label>
              <textarea value={form.entry} onChange={(e) => setForm(f => ({ ...f, entry: e.target.value }))} rows={4} className={inputCls} placeholder="I did some LeetCode today, but I'm feeling a bit stuck on Dynamic Programming..." />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-foreground)" }}>Small Wins 🏆</label>
                <textarea value={form.wins} onChange={(e) => setForm(f => ({ ...f, wins: e.target.value }))} rows={3} className={inputCls} placeholder="1. Solved 2 Mediums&#10;2. Fixed the navbar bug" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-foreground)" }}>Gratitude 🙏</label>
                <textarea value={form.gratitude} onChange={(e) => setForm(f => ({ ...f, gratitude: e.target.value }))} rows={3} className={inputCls} placeholder="1. Supportive friends&#10;2. Good coffee" />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
              <button onClick={handleSave} disabled={isSaving || !form.entry.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #06B6D4, #3B82F6)" }}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Entry
              </button>
            </div>
          </div>
        </motion.div>

        {/* History */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
            <BookOpen className="w-5 h-5 text-indigo-500" /> Past Entries
          </h2>
          
          {journals.length === 0 ? (
             <EmptyState icon={<PenLine className="w-6 h-6 text-cyan-400" />} title="No entries yet" description="Start journaling today to track your journey" />
          ) : (
            <div className="space-y-4 overflow-y-auto pr-2" style={{ maxHeight: "calc(100vh - 200px)" }}>
              {journals.filter(j => j._id !== todayJournal?._id).map((journal) => {
                const moodInfo = MOODS.find(m => m.value === journal.mood);
                const MoodIcon = moodInfo?.icon || Smile;
                
                return (
                  <motion.div key={journal._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl p-5 group transition-all hover:-translate-y-0.5" style={cardStyle}>
                    <div className="flex items-center justify-between mb-3 border-b pb-3" style={{ borderColor: "var(--color-border)" }}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
                        <span className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>{formatDate(journal.date as unknown as string)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: `${moodInfo?.color}15`, color: moodInfo?.color }}>
                        <MoodIcon className="w-3.5 h-3.5" /> {moodInfo?.label}
                      </div>
                    </div>
                    
                    <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--color-muted-foreground)" }}>
                      {journal.entry}
                    </p>
                    
                    {(journal.wins.length > 0 || journal.gratitude.length > 0) && (
                      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                        {journal.wins.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-foreground)" }}>Wins</p>
                            <ul className="space-y-1">
                              {journal.wins.map((w, i) => <li key={i} className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>• {w}</li>)}
                            </ul>
                          </div>
                        )}
                        {journal.gratitude.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-foreground)" }}>Gratitude</p>
                            <ul className="space-y-1">
                              {journal.gratitude.map((g, i) => <li key={i} className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>• {g}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
