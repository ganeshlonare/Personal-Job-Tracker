"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Mail } from "lucide-react";
import TargetSetter from "@/components/shared/TargetSetter";
import TargetProgress from "@/components/shared/TargetProgress";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { createColdMail, updateColdMail, deleteColdMail } from "@/actions/cold-mail.actions";
import { formatDate } from "@/lib/utils";
import { COLD_MAIL_TEMPLATES } from "@/lib/coldMailTemplates";

export interface IColdMail {
  _id: string;
  recipientName: string;
  recipientEmail?: string;
  company?: string;
  subject?: string;
  status: "sent" | "replied" | "bounced" | "ignored";
  date: string;
  templateId?: string;
  body?: string;
}

interface Props {
  initialMails?: IColdMail[];
}

function PaginatedList({ mails, onDelete }: { mails: IColdMail[]; onDelete?: (id: string) => void }) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const total = mails.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = mails.slice(start, start + pageSize);

  return (
    <div>
      <div className="space-y-3">
        {pageItems.map((m) => (
          <div
            key={m._id}
            className="p-4 rounded-xl flex justify-between items-start gap-4 transition-colors hover:bg-[var(--color-secondary)]/50"
            style={{ border: "1px solid var(--color-border)", background: "var(--color-card)" }}
          >
            <div className="min-w-0">
              <p className="font-semibold" style={{ color: "var(--color-foreground)" }}>
                {m.recipientName}{" "}
                {m.company && (
                  <span className="text-xs font-normal" style={{ color: "var(--color-muted-foreground)" }}>
                    @ {m.company}
                  </span>
                )}
              </p>
              <p className="text-sm truncate" style={{ color: "var(--color-muted-foreground)" }}>
                {m.recipientEmail || "No email"}
              </p>
              {m.subject && (
                <p className="mt-1.5 text-sm truncate" style={{ color: "var(--color-foreground)" }}>
                  {m.subject}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                {formatDate(m.date)}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onDelete) onDelete(m._id);
                }}
                className="text-xs font-medium text-red-500 hover:text-red-400 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">Showing {Math.min(total, start + 1)}-{Math.min(total, start + pageSize)} of {total}</div>
          <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            style={{ border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
          >
            Prev
          </button>
          <div className="text-sm tabular-nums" style={{ color: "var(--color-muted-foreground)" }}>
            {page}/{totalPages}
          </div>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-lg text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            style={{ border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ColdMailsClient({ initialMails = [] }: Props) {
  const [mails, setMails] = useState<IColdMail[]>(initialMails || []);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    recipientName: "",
    recipientEmail: "",
    company: "",
    subject: "",
    status: "sent" as IColdMail["status"],
    date: new Date().toISOString().split("T")[0],
    templateId: "",
    body: "",
  });

  const cardStyle = {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
  };

  const inputCls =
    "px-3 py-2.5 rounded-xl text-sm outline-none w-full cursor-text bg-[var(--color-secondary)] text-[var(--color-foreground)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/30 transition-all";

  const todayKey = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);
  const todays = mails.filter(m => m.date?.split("T")[0] === todayKey);

  function fillTemplateValues(tplBody?: string, tplSubject?: string) {
    const name = form.recipientName || "";
    const company = form.company || "";
    const yourName = "";
    const fill = (s?: string) => s ? s.replace(/\{name\}/g, name).replace(/\{company\}/g, company).replace(/\{yourName\}/g, yourName) : "";
    return { subject: fill(tplSubject), body: fill(tplBody) };
  }

  const handleSave = async (openMail = false) => {
    if (!form.recipientName.trim()) { toast.error('Recipient name required'); return; }
    // Build mailto URL early
    const mailto = openMail && form.recipientEmail
      ? `mailto:${encodeURIComponent(form.recipientEmail)}?subject=${encodeURIComponent(form.subject||'')}&body=${encodeURIComponent(form.body||'')}`
      : null;

    // Try to open mailto synchronously to ensure the mail compose opens in a new tab/window.
    // If that is blocked, fall back to opening a blank window and navigating it after save.
    let newWin: Window | null = null;
    if (mailto) {
      try {
        // Directly open the mailto; many browsers will trigger the mail client.
        newWin = window.open(mailto, '_blank', 'noopener,noreferrer');
      } catch (e) {
        newWin = null;
      }
      if (!newWin) {
        // popup likely blocked; open a blank tab synchronously to satisfy the browser, we'll navigate later
        try { newWin = window.open('', '_blank', 'noopener,noreferrer'); } catch { newWin = null; }
      }
    }
    setIsAdding(true);
    try {
      const payload = {
        recipientName: form.recipientName,
        recipientEmail: form.recipientEmail,
        company: form.company,
        subject: form.subject,
        status: form.status,
        templateId: form.templateId,
        body: form.body,
        date: new Date(form.date + "T00:00:00"),
      } as any;

      if (editingId) {
        const res = await updateColdMail(editingId, payload);
        if (res.error) { toast.error(res.error); return; }
        setMails(prev => prev.map(m => m._id === editingId ? { ...m, ...payload, date: payload.date.toISOString() } as IColdMail : m));
        toast.success('Updated');
      } else {
        const res = await createColdMail(payload);
        if (res.error) { toast.error(res.error); return; }
        const newMail: IColdMail = { _id: res.id!, recipientName: form.recipientName, recipientEmail: form.recipientEmail, company: form.company, subject: form.subject, status: payload.status, date: new Date(form.date).toISOString(), templateId: form.templateId, body: form.body };
        setMails(prev => [newMail, ...prev]);
        toast.success('Saved');
        if (mailto) {
          try {
            if (newWin) {
              // If newWin was opened as a blank tab, navigate it to the mailto URL now.
              // If newWin already points to mailto (direct open), this will just focus it.
              newWin.location.href = mailto;
              try { newWin.focus(); } catch {}
            } else {
              // last-resort: open mailto now
              window.open(mailto, '_blank', 'noopener,noreferrer');
            }
          } catch (e) {
            try { window.open(mailto, '_blank', 'noopener,noreferrer'); } catch {}
          }
        }
      }

      // reset form
      setForm({ recipientName: "", recipientEmail: "", company: "", subject: "", status: "sent", date: new Date().toISOString().split("T")[0], templateId: "", body: "" });
      setEditingId(null);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this cold mail record?')) return;
    await deleteColdMail(id);
    setMails(prev => prev.filter(m => m._id !== id));
    toast.success('Deleted');
  };

  const handleEdit = (m: IColdMail) => {
    setEditingId(m._id);
    setForm({ recipientName: m.recipientName, recipientEmail: m.recipientEmail||'', company: m.company||'', subject: m.subject||'', status: m.status, date: m.date.split('T')[0], templateId: m.templateId||'', body: m.body||'' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cold Mails"
        description="Track your outreach campaigns and follow-ups"
        badge={{ label: "total", count: mails.length }}
        actions={
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <TargetProgress category="cold-mail" title="Cold Mails" />
            <TargetSetter category="cold-mail" title="Cold Mails" />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl card-hover" style={cardStyle}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
            <Mail className="w-5 h-5 text-[#06B6D4]" />
            Compose Cold Mail
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Recipient Name" value={form.recipientName} onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))} className={inputCls} />
              <input placeholder="Recipient Email" value={form.recipientEmail} onChange={e => setForm(f => ({ ...f, recipientEmail: e.target.value }))} className={inputCls} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input placeholder="Company" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className={inputCls} />
              <input placeholder="Subject" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className={inputCls} />
              <select value={form.templateId} onChange={e => {
                const id = e.target.value; const tpl = COLD_MAIL_TEMPLATES.find(t => t.id === id);
                if (tpl) { const filled = fillTemplateValues(tpl.body, tpl.subject); setForm(f => ({ ...f, templateId: id, subject: filled.subject || f.subject, body: filled.body || f.body })); }
                else setForm(f => ({ ...f, templateId: id }));
              }} className={inputCls}>
                <option value="">Choose template</option>
                {COLD_MAIL_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold" style={{ color: 'var(--color-muted-foreground)' }}>Message</label>
                <div className="text-xs text-muted-foreground">You can edit the template before sending</div>
              </div>
              <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={10} className={inputCls} />
            </div>
            <div className="flex flex-wrap gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() =>
                  setForm({
                    recipientName: "",
                    recipientEmail: "",
                    company: "",
                    subject: "",
                    status: "sent",
                    date: new Date().toISOString().split("T")[0],
                    templateId: "",
                    body: "",
                  })
                }
                className="px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer hover:bg-[var(--color-secondary)] transition-colors"
                style={{ border: "1px solid var(--color-border)", color: "var(--color-muted-foreground)" }}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={isAdding}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#06B6D4,#3B82F6)" }}
              >
                {isAdding ? "Saving..." : editingId ? "Update" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isAdding || !form.recipientEmail}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#06B6D4,#10B981)" }}
              >
                {isAdding ? "Sending..." : "Send & Save"}
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl card-hover" style={cardStyle}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>
            Today&apos;s Sent
            <span
              className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(6,182,212,0.12)", color: "#06B6D4" }}
            >
              {todays.length}
            </span>
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {todays.length === 0 ? (
              <p className="text-sm text-muted-foreground">No mails sent today.</p>
            ) : (
              todays.map(m => (
                <div key={m._id} className="p-3 rounded-lg" style={{ border: '1px solid var(--color-border)' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{m.recipientName} {m.company && <span className="text-xs text-muted-foreground">@ {m.company}</span>}</p>
                      <p className="text-sm text-muted-foreground">{m.recipientEmail}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{formatDate(m.date)}</div>
                  </div>
                  {m.subject && <p className="mt-2 text-sm">{m.subject}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl card-hover" style={cardStyle}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>
          All Cold Mails
        </h3>
        <PaginatedList mails={mails} onDelete={handleDelete} />
      </div>
    </div>
  );
}
