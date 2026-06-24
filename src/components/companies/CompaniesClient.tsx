"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Plus, Search, Building2, Star, Trash2, X, Loader2, Globe, ExternalLink, Heart } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { createCompany, deleteCompany, toggleFavorite } from "@/actions/company.actions";
import type { ICompany } from "@/types";

interface CompaniesClientProps { initialCompanies: ICompany[] }

const INDUSTRIES = ["Technology", "Finance", "Healthcare", "E-commerce", "EdTech", "SaaS", "Consulting", "Gaming", "Startup", "MNC", "Product", "Service", "Other"];
const HIRING_FREQUENCIES = [
  { value: "always", label: "Always Hiring" },
  { value: "seasonal", label: "Seasonal" },
  { value: "rare", label: "Rare" },
];

export function CompaniesClient({ initialCompanies }: CompaniesClientProps) {
  const [companies, setCompanies] = useState<ICompany[]>(initialCompanies);
  const [showForm, setShowForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [showFavOnly, setShowFavOnly] = useState(false);

  const [form, setForm] = useState({
    name: "", industry: "", website: "", careerPage: "",
    hiringFrequency: "seasonal", notes: "", priority: "medium",
  });

  const filtered = companies.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.industry?.toLowerCase().includes(search.toLowerCase())) return false;
    if (showFavOnly && !c.favorite) return false;
    return true;
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEditClick = (company: ICompany) => {
    setForm({
      name: company.name,
      industry: company.industry || "",
      website: company.website || "",
      careerPage: company.careerPage || "",
      hiringFrequency: company.hiringFrequency || "seasonal",
      notes: company.notes || "",
      priority: company.priority || "medium",
    });
    setEditingId(company._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setIsAdding(true);
    try {
      if (editingId) {
        const { updateCompany } = await import("@/actions/company.actions");
        const result = await updateCompany(editingId, form);
        if (result.error) { toast.error(result.error); return; }
        
        setCompanies((prev) => prev.map((c) => 
          c._id === editingId ? { ...c, ...form, priority: form.priority as ICompany["priority"], hiringFrequency: form.hiringFrequency as ICompany["hiringFrequency"] } : c
        ));
        toast.success("Company updated!");
      } else {
        const result = await createCompany(form);
        if (result.error) { toast.error(result.error); return; }
        const newCo: ICompany = {
          _id: result.id!, userId: "", name: form.name, industry: form.industry,
          website: form.website, careerPage: form.careerPage, applicationCount: 0,
          contacts: [], favorite: false, responseHistory: [], tags: [],
          priority: form.priority as ICompany["priority"],
          hiringFrequency: form.hiringFrequency as ICompany["hiringFrequency"],
          notes: form.notes, createdAt: new Date(), updatedAt: new Date(),
        };
        setCompanies((prev) => [newCo, ...prev]);
        toast.success("Company added!");
      }
      setForm({ name: "", industry: "", website: "", careerPage: "", hiringFrequency: "seasonal", notes: "", priority: "medium" });
      setEditingId(null);
      setShowForm(false);
    } finally { setIsAdding(false); }
  };

  const handleToggleFav = async (id: string, current: boolean) => {
    setCompanies((prev) => prev.map((c) => c._id === id ? { ...c, favorite: !current } : c));
    await toggleFavorite(id, !current);
  };

  const handleDelete = async (id: string) => {
    setCompanies((prev) => prev.filter((c) => c._id !== id));
    await deleteCompany(id);
    toast.success("Company removed");
  };

  const cardStyle = { background: "var(--color-card)", border: "1px solid var(--color-border)" };
  const inputCls = `px-3 py-2 rounded-xl text-sm outline-none w-full bg-[var(--color-secondary)] text-[var(--color-foreground)] border border-[var(--color-border)] focus:border-[var(--color-primary)]`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company CRM"
        description="Manage your target companies and contacts"
        badge={{ label: "companies", count: companies.length }}
        actions={
          <button id="add-company-btn" onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all cursor-pointer"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
            <Plus className="w-4 h-4" /> Add Company
          </button>
        }
      />

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-muted-foreground)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search companies..." className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" }} />
        </div>
        <button onClick={() => setShowFavOnly(!showFavOnly)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all cursor-pointer"
          style={{ background: showFavOnly ? "#EF444418" : "var(--color-card)", border: "1px solid var(--color-border)", color: showFavOnly ? "#EF4444" : "var(--color-foreground)" }}>
          <Heart className={`w-4 h-4 ${showFavOnly ? "fill-current" : ""}`} />
          Favorites
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl p-5 overflow-hidden" style={{ ...cardStyle, border: "1px solid var(--color-primary)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
                {editingId ? "Edit Company" : "Add Company"}
              </h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); setForm({ name: "", industry: "", website: "", careerPage: "", hiringFrequency: "seasonal", notes: "", priority: "medium" }); }} className="cursor-pointer" style={{ color: "var(--color-muted-foreground)" }}><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="Company name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} autoFocus />
              <select value={form.industry} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))} className={inputCls}>
                <option value="">Industry</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
              <input placeholder="Website URL" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} className={inputCls} />
              <input placeholder="Career page URL" value={form.careerPage} onChange={(e) => setForm((f) => ({ ...f, careerPage: e.target.value }))} className={inputCls} />
              <select value={form.hiringFrequency} onChange={(e) => setForm((f) => ({ ...f, hiringFrequency: e.target.value }))} className={inputCls}>
                {HIRING_FREQUENCIES.map((h) => <option key={h.value} value={h.value}>{h.label}</option>)}
              </select>
              <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className={inputCls}>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <textarea placeholder="Notes..." value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className={`${inputCls} sm:col-span-2 resize-none`} />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => { setShowForm(false); setEditingId(null); setForm({ name: "", industry: "", website: "", careerPage: "", hiringFrequency: "seasonal", notes: "", priority: "medium" }); }} className="px-4 py-2 rounded-xl text-sm cursor-pointer" style={{ color: "var(--color-muted-foreground)" }}>Cancel</button>
              <button id="company-submit" onClick={handleAdd} disabled={isAdding || !form.name}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-60 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editingId ? "Save Changes" : "Add Company"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Company Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon={<Building2 className="w-6 h-6 text-green-400" />} title="No companies yet" description="Add companies you want to target" action={
          <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-xl text-sm font-medium text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>Add First Company</button>
        } />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((company) => (
            <motion.div key={company._id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="group rounded-2xl p-5 hover:-translate-y-0.5 transition-all" style={cardStyle}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: `hsl(${company.name.charCodeAt(0) * 7 % 360}, 65%, 50%)` }}>
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate" style={{ color: "var(--color-foreground)" }}>{company.name}</h3>
                    {company.industry && <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{company.industry}</p>}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handleToggleFav(company._id, company.favorite)} className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-secondary)] cursor-pointer"
                    style={{ color: company.favorite ? "#EF4444" : "var(--color-muted-foreground)" }}>
                    <Heart className={`w-4 h-4 ${company.favorite ? "fill-current" : ""}`} />
                  </button>
                  <button onClick={() => handleEditClick(company)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-blue-400 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button onClick={() => handleDelete(company._id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-red-400 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                {company.hiringFrequency && (
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--color-secondary)", color: "var(--color-muted-foreground)" }}>
                    {HIRING_FREQUENCIES.find((h) => h.value === company.hiringFrequency)?.label}
                  </span>
                )}
                {company.notes && <p className="text-xs line-clamp-2" style={{ color: "var(--color-muted-foreground)" }}>{company.notes}</p>}
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 hover:opacity-70" style={{ color: "var(--color-primary)" }}>
                    <Globe className="w-3 h-3" />Website
                  </a>
                )}
                {company.careerPage && (
                  <a href={company.careerPage} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 hover:opacity-70" style={{ color: "var(--color-primary)" }}>
                    <ExternalLink className="w-3 h-3" />Jobs
                  </a>
                )}
                <span className="ml-auto text-xs" style={{ color: "var(--color-muted-foreground)" }}>{company.applicationCount} apps</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
