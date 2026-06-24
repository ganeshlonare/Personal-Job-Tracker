"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Plus, Video, Calendar, Star, CheckCircle, XCircle, Clock, Trash2, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { createInterview, deleteInterview } from "@/actions/interview.actions";
import { formatDate } from "@/lib/utils";
import type { IInterview } from "@/types";

interface InterviewsClientProps { initialInterviews: IInterview[] }

const ROUNDS = ["Technical Round 1", "Technical Round 2", "System Design", "Behavioral / HR", "Manager Round", "Final Round", "OA / Assessment", "Group Discussion"];
const RESULTS: { value: IInterview["result"]; label: string; color: string }[] = [
  { value: "passed", label: "Passed", color: "#22C55E" },
  { value: "failed", label: "Failed", color: "#EF4444" },
  { value: "pending", label: "Pending", color: "#F59E0B" },
  { value: "cancelled", label: "Cancelled", color: "#6B7280" },
];

export function InterviewsClient({ initialInterviews }: InterviewsClientProps) {
  const [interviews, setInterviews] = useState<IInterview[]>(initialInterviews);
  const [showForm, setShowForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    company: "", role: "", date: "", round: "Technical Round 1",
    result: "pending" as IInterview["result"],
    personalRating: "3",
    questionsAsked: "", codingQuestions: "", behavioralQuestions: "",
    mistakes: "", topicsToRevise: "", notes: "", interviewerFeedback: "",
  });

  const handleAdd = async () => {
    if (!form.company || !form.role || !form.date) return;
    setIsAdding(true);
    try {
      const result = await createInterview({
        ...form,
        date: new Date(form.date),
        personalRating: parseInt(form.personalRating) || 3,
        questionsAsked: form.questionsAsked.split("\n").filter(Boolean),
        codingQuestions: form.codingQuestions.split("\n").filter(Boolean),
        behavioralQuestions: form.behavioralQuestions.split("\n").filter(Boolean),
        topicsToRevise: form.topicsToRevise.split(",").map((t) => t.trim()).filter(Boolean),
      });
      if (result.error) { toast.error(result.error); return; }
      const newInterview: IInterview = {
        _id: result.id!, userId: "", company: form.company, role: form.role,
        date: new Date(form.date), round: form.round, result: form.result,
        personalRating: parseInt(form.personalRating), questionsAsked: [],
        codingQuestions: [], behavioralQuestions: [], topicsToRevise: [],
        createdAt: new Date(), updatedAt: new Date(),
      };
      setInterviews((prev) => [newInterview, ...prev]);
      setForm({ company: "", role: "", date: "", round: "Technical Round 1", result: "pending", personalRating: "3", questionsAsked: "", codingQuestions: "", behavioralQuestions: "", mistakes: "", topicsToRevise: "", notes: "", interviewerFeedback: "" });
      setShowForm(false);
      toast.success("Interview logged!");
    } finally { setIsAdding(false); }
  };

  const handleDelete = async (id: string) => {
    setInterviews((prev) => prev.filter((i) => i._id !== id));
    await deleteInterview(id);
    toast.success("Interview deleted");
  };

  const cardStyle = { background: "var(--color-card)", border: "1px solid var(--color-border)" };
  const inputCls = `px-3 py-2 rounded-xl text-sm outline-none w-full bg-[var(--color-secondary)] text-[var(--color-foreground)] border border-[var(--color-border)] focus:border-[var(--color-primary)]`;

  const upcomingCount = interviews.filter((i) => new Date(i.date) > new Date() && i.result === "pending").length;
  const passedCount = interviews.filter((i) => i.result === "passed").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interviews"
        description="Log and review every interview experience"
        badge={{ label: "total", count: interviews.length }}
        actions={
          <button id="add-interview-btn" onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            style={{ background: "linear-gradient(135deg, #EC4899, #8B5CF6)" }}>
            <Plus className="w-4 h-4" /> Log Interview
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Upcoming", value: upcomingCount, color: "#3B82F6" },
          { label: "Passed", value: passedCount, color: "#22C55E" },
          { label: "Total", value: interviews.length, color: "#6366F1" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4 text-center" style={cardStyle}>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl p-5 overflow-hidden" style={{ ...cardStyle, border: "1px solid var(--color-primary)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>Log Interview</h3>
              <button onClick={() => setShowForm(false)} className="cursor-pointer" style={{ color: "var(--color-muted-foreground)" }}><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="Company *" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} className={inputCls} autoFocus />
              <input placeholder="Role *" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className={inputCls} />
              <input type="datetime-local" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={inputCls} />
              <select value={form.round} onChange={(e) => setForm((f) => ({ ...f, round: e.target.value }))} className={inputCls}>
                {ROUNDS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <select value={form.result} onChange={(e) => setForm((f) => ({ ...f, result: e.target.value as IInterview["result"] }))} className={inputCls}>
                {RESULTS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--color-muted-foreground)" }}>Self Rating ({form.personalRating}/5)</label>
                <input type="range" min="1" max="5" value={form.personalRating} onChange={(e) => setForm((f) => ({ ...f, personalRating: e.target.value }))} className="w-full accent-indigo-500" />
              </div>
              <textarea placeholder="Questions asked (one per line)" value={form.questionsAsked} onChange={(e) => setForm((f) => ({ ...f, questionsAsked: e.target.value }))} rows={3} className={`${inputCls} resize-none`} />
              <textarea placeholder="Coding questions (one per line)" value={form.codingQuestions} onChange={(e) => setForm((f) => ({ ...f, codingQuestions: e.target.value }))} rows={3} className={`${inputCls} resize-none`} />
              <textarea placeholder="Topics to revise (comma-separated)" value={form.topicsToRevise} onChange={(e) => setForm((f) => ({ ...f, topicsToRevise: e.target.value }))} rows={2} className={`${inputCls} sm:col-span-2 resize-none`} />
              <textarea placeholder="Mistakes made..." value={form.mistakes} onChange={(e) => setForm((f) => ({ ...f, mistakes: e.target.value }))} rows={2} className={`${inputCls} sm:col-span-2 resize-none`} />
              <textarea placeholder="Notes..." value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className={`${inputCls} sm:col-span-2 resize-none`} />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm cursor-pointer" style={{ color: "var(--color-muted-foreground)" }}>Cancel</button>
              <button id="interview-submit" onClick={handleAdd} disabled={isAdding || !form.company || !form.role || !form.date}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-60 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #EC4899, #8B5CF6)" }}>
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Log
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interview List */}
      {interviews.length === 0 ? (
        <EmptyState icon={<Video className="w-6 h-6 text-pink-400" />} title="No interviews logged" description="Log your first interview experience" />
      ) : (
        <div className="space-y-3">
          {interviews.map((interview) => {
            const resultInfo = RESULTS.find((r) => r.value === interview.result);
            const isExpanded = expandedId === interview._id;
            const isUpcoming = new Date(interview.date) > new Date();
            return (
              <div key={interview._id} className="rounded-2xl overflow-hidden" style={cardStyle}>
                <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : interview._id)}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: `hsl(${interview.company.charCodeAt(0) * 7 % 360}, 65%, 50%)` }}>
                    {interview.company.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: "var(--color-foreground)" }}>{interview.company}</p>
                    <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{interview.role} · {interview.round}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                      <Calendar className="w-3 h-3" />{formatDate(interview.date as unknown as string)}
                      {isUpcoming && <span className="ml-1 text-blue-400 font-medium">(upcoming)</span>}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${resultInfo?.color}18`, color: resultInfo?.color }}>
                      {resultInfo?.label}
                    </span>
                    {interview.personalRating && (
                      <span className="flex items-center gap-0.5 text-xs" style={{ color: "#F59E0B" }}>
                        <Star className="w-3 h-3 fill-current" />{interview.personalRating}
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4" style={{ color: "var(--color-muted-foreground)" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "var(--color-muted-foreground)" }} />}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                      className="overflow-hidden border-t" style={{ borderColor: "var(--color-border)" }}>
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        {interview.questionsAsked?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-muted-foreground)" }}>Questions Asked</p>
                            <ul className="space-y-1">{interview.questionsAsked.map((q, i) => <li key={i} className="text-xs" style={{ color: "var(--color-foreground)" }}>• {q}</li>)}</ul>
                          </div>
                        )}
                        {interview.topicsToRevise?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-muted-foreground)" }}>Topics to Revise</p>
                            <div className="flex flex-wrap gap-1">{interview.topicsToRevise.map((t, i) => <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#EF444420", color: "#EF4444" }}>{t}</span>)}</div>
                          </div>
                        )}
                        {interview.mistakes && (
                          <div className="sm:col-span-2">
                            <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-muted-foreground)" }}>Mistakes</p>
                            <p className="text-xs" style={{ color: "var(--color-foreground)" }}>{interview.mistakes}</p>
                          </div>
                        )}
                        <div className="sm:col-span-2 flex justify-end">
                          <button onClick={() => handleDelete(interview._id)} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-500 transition-colors cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
