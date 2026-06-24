"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, Plus, Download, Eye, Trash2, CheckCircle2, Circle } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function ResumesClient() {
  const [resumes, setResumes] = useState([
    { id: "1", name: "Software Engineer", version: "v2.4", active: true, updatedAt: new Date(), applicationCount: 15, interviewCount: 3 },
    { id: "2", name: "Frontend Developer", version: "v1.2", active: false, updatedAt: new Date(Date.now() - 86400000 * 5), applicationCount: 8, interviewCount: 1 },
    { id: "3", name: "Full Stack Engineer", version: "v3.0", active: false, updatedAt: new Date(Date.now() - 86400000 * 12), applicationCount: 32, interviewCount: 4 },
  ]);

  const toggleActive = (id: string) => {
    setResumes(prev => prev.map(r => ({
      ...r,
      active: r.id === id ? true : false
    })));
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>
            Resume Manager
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>
            Manage multiple resume versions tailored for different roles
          </p>
        </div>

        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 shadow-sm"
          style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
        >
          <Upload className="w-4 h-4" />
          Upload New Version
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resumes.map((resume) => (
          <motion.div
            key={resume.id}
            variants={itemVariants}
            className={`p-6 rounded-2xl border transition-all hover:-translate-y-1 ${
              resume.active 
                ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                : "border-[var(--color-border)] shadow-sm"
            }`}
            style={{ background: "var(--color-card)" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: resume.active ? "rgba(16,185,129,0.1)" : "var(--color-secondary)", color: resume.active ? "#10B981" : "var(--color-muted-foreground)" }}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: "var(--color-foreground)" }}>{resume.name}</h3>
                  <p className="text-xs font-medium" style={{ color: "var(--color-muted-foreground)" }}>{resume.version}</p>
                </div>
              </div>
              
              <button 
                onClick={() => toggleActive(resume.id)}
                className="transition-colors"
              >
                {resume.active ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : (
                  <Circle className="w-6 h-6 text-[var(--color-muted-foreground)] hover:text-emerald-500" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 rounded-xl" style={{ background: "var(--color-secondary)" }}>
                <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Applications</p>
                <p className="text-lg font-bold" style={{ color: "var(--color-foreground)" }}>{resume.applicationCount}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "var(--color-secondary)" }}>
                <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Interviews</p>
                <p className="text-lg font-bold" style={{ color: "var(--color-foreground)" }}>{resume.interviewCount}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
              <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                Updated {formatRelativeDate(resume.updatedAt.toISOString())}
              </span>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-md hover:bg-[var(--color-secondary)] transition-colors" title="View">
                  <Eye className="w-4 h-4 text-[var(--color-muted-foreground)]" />
                </button>
                <button className="p-1.5 rounded-md hover:bg-[var(--color-secondary)] transition-colors" title="Download">
                  <Download className="w-4 h-4 text-[var(--color-muted-foreground)]" />
                </button>
                {!resume.active && (
                  <button className="p-1.5 rounded-md hover:bg-red-500/10 transition-colors group" title="Delete">
                    <Trash2 className="w-4 h-4 text-[var(--color-muted-foreground)] group-hover:text-red-500" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add New Resume Card */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl border border-dashed border-[var(--color-border)] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:bg-[var(--color-secondary)] hover:border-indigo-500/50"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-indigo-500/10">
            <Plus className="w-6 h-6 text-indigo-500" />
          </div>
          <div className="text-center">
            <h3 className="font-medium" style={{ color: "var(--color-foreground)" }}>Create New Variant</h3>
            <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>Optimize for a new role</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
