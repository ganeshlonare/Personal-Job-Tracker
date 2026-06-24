"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Plus, FolderKanban, GitBranch, Globe, Trash2, X, Loader2, TrendingUp, Clock, Edit3 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { createProject, deleteProject, updateProject } from "@/actions/project.actions";
import { calculatePercentage } from "@/lib/utils";
import type { IProject } from "@/types";

interface ProjectsClientProps { initialProjects: IProject[] }

const PROJECT_STATUSES = [
  { value: "planning", label: "Planning", color: "#6B7280" },
  { value: "in_progress", label: "In Progress", color: "#3B82F6" },
  { value: "completed", label: "Completed", color: "#22C55E" },
  { value: "paused", label: "Paused", color: "#F59E0B" },
];

export function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const [projects, setProjects] = useState<IProject[]>(initialProjects);
  const [showForm, setShowForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProgress, setEditingProgress] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(0);

  const [form, setForm] = useState({
    title: "", description: "", techStack: "",
    githubLink: "", liveLink: "", status: "in_progress",
    priority: "medium",
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEditClick = (project: IProject) => {
    setForm({
      title: project.title,
      description: project.description || "",
      techStack: project.techStack.join(", "),
      githubLink: project.githubLink || "",
      liveLink: project.demoLink || "",
      status: project.status || "in_progress",
      priority: (project as any).priority || "medium",
    });
    setEditingId(project._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    setIsAdding(true);
    try {
      const techStackArray = form.techStack.split(",").map((t) => t.trim()).filter(Boolean);
      const dataToSave = { ...form, techStack: techStackArray, demoLink: form.liveLink };
      
      if (editingId) {
        const result = await updateProject(editingId, dataToSave);
        if (result.error) { toast.error(result.error); return; }
        setProjects((prev) => prev.map((p) => 
          p._id === editingId ? { ...p, ...dataToSave, status: dataToSave.status as IProject["status"] } : p
        ));
        toast.success("Project updated!");
      } else {
        const result = await createProject(dataToSave);
        if (result.error) { toast.error(result.error); return; }
        const newProject: IProject = {
          _id: result.id!, userId: "", title: form.title, description: form.description,
          techStack: techStackArray,
          githubLink: form.githubLink, demoLink: form.liveLink,
          status: form.status as IProject["status"],
          progress: 0, milestones: [], tasks: [], dailyLogs: [], images: [],
          startDate: new Date(), createdAt: new Date(), updatedAt: new Date(),
        };
        setProjects((prev) => [newProject, ...prev]);
        toast.success("Project created!");
      }
      setForm({ title: "", description: "", techStack: "", githubLink: "", liveLink: "", status: "in_progress", priority: "medium" });
      setEditingId(null);
      setShowForm(false);
    } finally { setIsAdding(false); }
  };

  const handleUpdateProgress = async (id: string) => {
    await updateProject(id, { progress: progressValue });
    setProjects((prev) => prev.map((p) => p._id === id ? { ...p, progress: progressValue } : p));
    setEditingProgress(null);
    toast.success("Progress updated!");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    setProjects((prev) => prev.filter((p) => p._id !== id));
    await deleteProject(id);
    toast.success("Project deleted");
  };

  const cardStyle = { background: "var(--color-card)", border: "1px solid var(--color-border)" };
  const inputCls = `px-3 py-2 rounded-xl text-sm outline-none w-full bg-[var(--color-secondary)] text-[var(--color-foreground)] border border-[var(--color-border)] focus:border-[var(--color-primary)]`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Track your side projects and portfolio work"
        badge={{ label: "in progress", count: projects.filter((p) => p.status === "in_progress").length }}
        actions={
          <button id="add-project-btn" onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all cursor-pointer"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
            <Plus className="w-4 h-4" /> New Project
          </button>
        }
      />

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl p-5 overflow-hidden" style={{ ...cardStyle, border: "1px solid var(--color-primary)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
                {editingId ? "Edit Project" : "New Project"}
              </h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); setForm({ title: "", description: "", techStack: "", githubLink: "", liveLink: "", status: "in_progress", priority: "medium" }); }} className="cursor-pointer" style={{ color: "var(--color-muted-foreground)" }}><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="Project name *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={`${inputCls} sm:col-span-2`} autoFocus />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className={`${inputCls} sm:col-span-2 resize-none`} />
              <input placeholder="Tech stack (comma-separated: React, Node.js...)" value={form.techStack} onChange={(e) => setForm((f) => ({ ...f, techStack: e.target.value }))} className={`${inputCls} sm:col-span-2`} />
              <input placeholder="GitHub URL" value={form.githubLink} onChange={(e) => setForm((f) => ({ ...f, githubLink: e.target.value }))} className={inputCls} />
              <input placeholder="Live URL" value={form.liveLink} onChange={(e) => setForm((f) => ({ ...f, liveLink: e.target.value }))} className={inputCls} />
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputCls}>
                {PROJECT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className={inputCls}>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => { setShowForm(false); setEditingId(null); setForm({ title: "", description: "", techStack: "", githubLink: "", liveLink: "", status: "in_progress", priority: "medium" }); }} className="px-4 py-2 rounded-xl text-sm cursor-pointer" style={{ color: "var(--color-muted-foreground)" }}>Cancel</button>
              <button id="project-submit" onClick={handleAdd} disabled={isAdding || !form.title}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-60 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editingId ? "Save Changes" : "Create"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <EmptyState icon={<FolderKanban className="w-6 h-6 text-green-400" />} title="No projects yet" description="Add your first project to start tracking progress" action={
          <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-xl text-sm font-medium text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>Start a Project</button>
        } />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((project) => {
            const statusInfo = PROJECT_STATUSES.find((s) => s.value === project.status);
            return (
              <motion.div key={project._id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="group rounded-2xl p-5" style={cardStyle}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate" style={{ color: "var(--color-foreground)" }}>{project.title}</h3>
                    {project.description && <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--color-muted-foreground)" }}>{project.description}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEditClick(project)} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 flex-shrink-0 ml-2 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button onClick={() => handleDelete(project._id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 flex-shrink-0 ml-2 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: "var(--color-muted-foreground)" }}>Progress</span>
                    <span className="font-bold" style={{ color: "var(--color-primary)" }}>{project.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-secondary)" }}>
                    <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${project.progress}%` }} transition={{ duration: 0.7, ease: "easeOut" }}
                      style={{ background: project.progress === 100 ? "#22C55E" : "linear-gradient(90deg, #10B981, #059669)" }} />
                  </div>

                  {/* Edit progress */}
                  {editingProgress === project._id ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input type="range" min="0" max="100" value={progressValue} onChange={(e) => setProgressValue(parseInt(e.target.value))} className="flex-1 accent-green-500" />
                      <span className="text-xs w-8 text-center" style={{ color: "var(--color-foreground)" }}>{progressValue}%</span>
                      <button onClick={() => handleUpdateProgress(project._id)} className="text-xs px-2 py-1 rounded-lg text-white cursor-pointer" style={{ background: "#10B981" }}>Save</button>
                      <button onClick={() => setEditingProgress(null)} className="text-xs px-2 py-1 rounded-lg cursor-pointer" style={{ color: "var(--color-muted-foreground)" }}>×</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingProgress(project._id); setProgressValue(project.progress); }}
                      className="flex items-center gap-1 text-xs mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" style={{ color: "var(--color-primary)" }}>
                      <Edit3 className="w-3 h-3" /> Update progress
                    </button>
                  )}
                </div>

                {/* Tech Stack */}
                {project.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.techStack.slice(0, 4).map((tech) => (
                      <span key={tech} className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--color-secondary)", color: "var(--color-muted-foreground)" }}>{tech}</span>
                    ))}
                    {project.techStack.length > 4 && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--color-secondary)", color: "var(--color-muted-foreground)" }}>+{project.techStack.length - 4}</span>}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {project.githubLink && <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 hover:opacity-70" style={{ color: "var(--color-muted-foreground)" }}><GitBranch className="w-3.5 h-3.5" />GitHub</a>}
                    {project.demoLink && <a href={project.demoLink} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 hover:opacity-70" style={{ color: "var(--color-primary)" }}><Globe className="w-3.5 h-3.5" />Live</a>}
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${statusInfo?.color}18`, color: statusInfo?.color }}>{statusInfo?.label}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
