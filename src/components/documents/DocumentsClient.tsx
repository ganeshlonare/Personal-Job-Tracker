"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Folder, Upload, Search, FileText, Image as ImageIcon, Download, Trash2, MoreVertical, Plus } from "lucide-react";
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

export function DocumentsClient() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const documents = [
    { id: "1", name: "Cover_Letter_Google.pdf", type: "pdf", category: "cover_letter", size: "124 KB", uploadedAt: new Date(), icon: <FileText className="w-5 h-5 text-red-500" /> },
    { id: "2", name: "Offer_Letter_Meta.pdf", type: "pdf", category: "offer_letter", size: "2.1 MB", uploadedAt: new Date(Date.now() - 86400000 * 3), icon: <FileText className="w-5 h-5 text-red-500" /> },
    { id: "3", name: "BTech_Transcript.pdf", type: "pdf", category: "transcript", size: "4.5 MB", uploadedAt: new Date(Date.now() - 86400000 * 15), icon: <FileText className="w-5 h-5 text-red-500" /> },
    { id: "4", name: "AWS_Certificate.png", type: "image", category: "certificate", size: "1.2 MB", uploadedAt: new Date(Date.now() - 86400000 * 30), icon: <ImageIcon className="w-5 h-5 text-blue-500" /> },
    { id: "5", name: "System_Design_Notes.docx", type: "doc", category: "notes", size: "45 KB", uploadedAt: new Date(Date.now() - 86400000 * 45), icon: <FileText className="w-5 h-5 text-blue-600" /> },
  ];

  const filteredDocs = documents.filter(doc => 
    (activeTab === "all" || doc.category === activeTab) &&
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: "all", label: "All Files" },
    { id: "cover_letter", label: "Cover Letters" },
    { id: "offer_letter", label: "Offers" },
    { id: "certificate", label: "Certificates" },
    { id: "transcript", label: "Transcripts" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>
            Documents
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>
            Store and organize your career-related files securely
          </p>
        </div>

        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 shadow-sm"
          style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
        >
          <Upload className="w-4 h-4" />
          Upload File
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <motion.div variants={itemVariants} className="md:w-64 flex-shrink-0 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-foreground)]"
            />
          </div>

          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 px-2" style={{ color: "var(--color-muted-foreground)" }}>
              Categories
            </h3>
            <div className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === tab.id
                      ? "bg-indigo-500/10 text-indigo-500 font-medium"
                      : "text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Folder className={`w-4 h-4 ${activeTab === tab.id ? "fill-indigo-500/20" : ""}`} />
                    {tab.label}
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                    {tab.id === "all" ? documents.length : documents.filter(d => d.category === tab.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* File Grid */}
        <div className="flex-1">
          {filteredDocs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocs.map((doc) => (
                <motion.div
                  key={doc.id}
                  variants={itemVariants}
                  className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-4 transition-all hover:-translate-y-1 hover:shadow-md group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-secondary)] flex items-center justify-center">
                      {doc.icon}
                    </div>
                    <button className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--color-secondary)] text-[var(--color-muted-foreground)]">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h4 className="font-medium text-sm truncate mb-1" style={{ color: "var(--color-foreground)" }} title={doc.name}>
                    {doc.name}
                  </h4>
                  
                  <div className="flex items-center justify-between text-xs mt-4">
                    <span style={{ color: "var(--color-muted-foreground)" }}>{doc.size}</span>
                    <span style={{ color: "var(--color-muted-foreground)" }}>{formatRelativeDate(doc.uploadedAt.toISOString())}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--color-border)] opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--color-secondary)] text-[var(--color-foreground)] transition-colors">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <button className="flex items-center justify-center p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--color-muted-foreground)] hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}

              <motion.div
                variants={itemVariants}
                className="rounded-2xl border border-dashed border-[var(--color-border)] flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:bg-[var(--color-secondary)] hover:border-indigo-500/50 min-h-[160px]"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-500/10">
                  <Plus className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="text-center">
                  <h3 className="font-medium text-sm" style={{ color: "var(--color-foreground)" }}>Upload File</h3>
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div variants={itemVariants} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[var(--color-secondary)] flex items-center justify-center mb-4">
                <Folder className="w-8 h-8 text-[var(--color-muted-foreground)]" />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-foreground)" }}>No files found</h3>
              <p className="text-sm max-w-sm mx-auto mb-6" style={{ color: "var(--color-muted-foreground)" }}>
                We couldn't find any documents matching your search or filter criteria.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
