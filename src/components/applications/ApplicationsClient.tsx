"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Filter, LayoutGrid, List, Table2,
  Send, Building2, MapPin, Clock, ExternalLink,
  Trash2, Archive, MoreVertical, Calendar, X
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import TargetSetter from "@/components/shared/TargetSetter";
import TargetProgress from "@/components/shared/TargetProgress";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { deleteApplication, archiveApplication, updateApplication } from "@/actions/application.actions";
import { APPLICATION_STATUSES, PRIORITIES } from "@/lib/constants";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import type { IApplication } from "@/types";
import { ApplicationDetailClient } from "./ApplicationDetailClient";
import { TodaysApplications } from "./TodaysApplications";

interface ApplicationsClientProps {
  initialApplications: IApplication[];
  initialTodaysApplications?: IApplication[];
}

type ViewMode = "list" | "kanban" | "table";

export function ApplicationsClient({
  initialApplications,
}: ApplicationsClientProps) {
  const [applications, setApplications] = useState<IApplication[]>(initialApplications);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<IApplication | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Compute todays applications strictly on the client using local timezone
  const todaysApplications = useMemo(() => {
    return applications.filter((app) => {
      if (app.appliedDate) {
        return new Date(app.appliedDate as unknown as string).toDateString() === new Date().toDateString();
      }
      return new Date(app.createdAt as unknown as string).toDateString() === new Date().toDateString() && !["wishlist", "planning"].includes(app.status);
    });
  }, [applications]);

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !app.company.toLowerCase().includes(q) &&
          !app.role.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (statusFilter !== "all" && app.status !== statusFilter) return false;
      if (priorityFilter !== "all" && app.priority !== priorityFilter) return false;
      return true;
    });
  }, [applications, searchQuery, statusFilter, priorityFilter]);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, priorityFilter, viewMode]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this application? This cannot be undone.")) return;
    setIsDeleting(id);
    const result = await deleteApplication(id);
    if (result.success) {
      setApplications((prev) => prev.filter((a) => a._id !== id));
      toast.success("Application deleted");
    } else {
      toast.error("Failed to delete");
    }
    setIsDeleting(null);
  };

  const handleArchive = async (id: string) => {
    const result = await archiveApplication(id);
    if (result.success) {
      setApplications((prev) => prev.filter((a) => a._id !== id));
      toast.success("Application archived");
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const result = await updateApplication(id, { status });
    if (result.success) {
      setApplications((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: status as IApplication["status"] } : a))
      );
      toast.success("Status updated");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Track every job application from wishlist to offer"
        badge={{ label: "total", count: applications.length }}
        actions={
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <TargetProgress category="application" title="Applications" />
            <TargetSetter category="application" title="Applications" />
            <Link
              href="/applications/new"
              id="add-application-btn"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"
              style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
            >
              <Plus className="w-4 h-4" />
              Add Application
            </Link>
          </div>
        }
      />

      <TodaysApplications
        applications={todaysApplications}
        onSelect={setSelectedApp}
      />

      <div
        className="rounded-2xl p-1"
        style={{ background: "var(--color-secondary)" }}
      >
        <div
          className="rounded-xl p-5 space-y-5"
          style={{
            background: "var(--color-background)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--color-foreground)" }}
              >
                All Applications
              </h2>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                Browse, filter, and manage your full pipeline
              </p>
            </div>
          </div>

          {/* Status summary pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Total", count: applications.length, color: "#6366F1" },
              {
                label: "Active",
                count: applications.filter((a) =>
                  ["applied", "assessment_received", "assessment_completed",
                   "interview_scheduled", "technical_round", "manager_round",
                   "hr_round", "final_round"].includes(a.status)
                ).length,
                color: "#3B82F6",
              },
              {
                label: "Offers",
                count: applications.filter((a) =>
                  ["offer", "accepted"].includes(a.status)
                ).length,
                color: "#22C55E",
              },
              {
                label: "Rejected",
                count: applications.filter((a) => a.status === "rejected").length,
                color: "#EF4444",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: `${s.color}15`,
                  color: s.color,
                  border: `1px solid ${s.color}25`,
                }}
              >
                {s.label}: <span className="font-bold">{s.count}</span>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--color-muted-foreground)" }}
              />
              <input
                id="app-search"
                type="text"
                placeholder="Search by company or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all cursor-text"
                style={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-foreground)",
                }}
              />
            </div>

            <select
              id="app-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                color: "var(--color-foreground)",
              }}
            >
              <option value="all">All Statuses</option>
              {APPLICATION_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <select
              id="app-priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                color: "var(--color-foreground)",
              }}
            >
              <option value="all">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>

            <div
              className="flex rounded-xl overflow-hidden border"
              style={{ borderColor: "var(--color-border)" }}
            >
              {([
                { mode: "list" as const, icon: List },
                { mode: "table" as const, icon: Table2 },
                { mode: "kanban" as const, icon: LayoutGrid },
              ] as const).map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  id={`view-${mode}`}
                  onClick={() => setViewMode(mode)}
                  className="px-3 py-2.5 transition-all cursor-pointer"
                  style={{
                    background:
                      viewMode === mode
                        ? "var(--color-primary)"
                        : "var(--color-card)",
                    color:
                      viewMode === mode
                        ? "white"
                        : "var(--color-muted-foreground)",
                  }}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Application List */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Send className="w-6 h-6 text-blue-400" />}
              title={
                searchQuery || statusFilter !== "all"
                  ? "No applications match your filters"
                  : "No applications yet"
              }
              description={
                searchQuery
                  ? "Try adjusting your search"
                  : "Start by adding your first job application"
              }
              action={
                !searchQuery && statusFilter === "all" ? (
                  <Link
                    href="/applications/new"
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
                  >
                    Add Your First Application
                  </Link>
                ) : undefined
              }
            />
          ) : viewMode === "kanban" ? (
            <KanbanView
              applications={filtered}
              onStatusChange={handleStatusChange}
              onSelect={setSelectedApp}
            />
          ) : (
            <>
              {viewMode === "table" ? (
                <TableView
                  applications={filtered.slice((page - 1) * pageSize, page * pageSize)}
                  onDelete={handleDelete}
                  onArchive={handleArchive}
                  onSelect={setSelectedApp}
                  isDeleting={isDeleting}
                />
              ) : (
                <ListView
                  applications={filtered.slice((page - 1) * pageSize, page * pageSize)}
                  onDelete={handleDelete}
                  onArchive={handleArchive}
                  onSelect={setSelectedApp}
                  isDeleting={isDeleting}
                />
              )}
              
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {Math.min(filtered.length, (page - 1) * pageSize + 1)}-{Math.min(filtered.length, page * pageSize)} of {filtered.length}
                </div>
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
                    {page}/{Math.max(1, Math.ceil(filtered.length / pageSize))}
                  </div>
                  <button
                    type="button"
                    disabled={page >= Math.max(1, Math.ceil(filtered.length / pageSize))}
                    onClick={() => setPage((p) => Math.min(Math.max(1, Math.ceil(filtered.length / pageSize)), p + 1))}
                    className="px-3 py-1.5 rounded-lg text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Slide-over Panel for Application Details */}
      <AnimatePresence>
        {selectedApp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-[var(--color-background)] border-l border-[var(--color-border)] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                <h2 className="font-semibold text-lg" style={{ color: "var(--color-foreground)" }}>
                  Application Details
                </h2>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-2 rounded-lg hover:bg-[var(--color-secondary)] transition-colors cursor-pointer"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <ApplicationDetailClient
                  application={selectedApp}
                  onUpdate={(updatedApp) => {
                    setApplications((prev) =>
                      prev.map((a) => (a._id === updatedApp._id ? updatedApp : a))
                    );
                    setSelectedApp(updatedApp);
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// List View
// ============================================
function ListView({
  applications,
  onDelete,
  onArchive,
  onSelect,
  isDeleting,
}: {
  applications: IApplication[];
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onSelect: (app: IApplication) => void;
  isDeleting: string | null;
}) {
  return (
    <motion.div
      className="space-y-3"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
    >
      {applications.map((app) => (
        <motion.div
          key={app._id}
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <ApplicationCard
            application={app}
            onDelete={onDelete}
            onArchive={onArchive}
            onSelect={onSelect}
            isDeleting={isDeleting === app._id}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

function ApplicationCard({
  application: app,
  onDelete,
  onArchive,
  onSelect,
  isDeleting,
}: {
  application: IApplication;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onSelect: (app: IApplication) => void;
  isDeleting: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const priorityColors: Record<string, string> = {
    low: "#6B7280",
    medium: "#F59E0B",
    high: "#F97316",
    critical: "#EF4444",
  };

  return (
    <div
      className="group flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        opacity: isDeleting ? 0.5 : 1,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* Company logo/letter */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
        style={{
          background: `hsl(${app.company.charCodeAt(0) * 7 % 360}, 65%, 50%)`,
        }}
      >
        {app.company.charAt(0).toUpperCase()}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onSelect(app)}
            className="font-semibold text-sm hover:underline text-left cursor-pointer"
            style={{ color: "var(--color-foreground)" }}
          >
            {app.role}
          </button>
          <span
            className="text-xs"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            @
          </span>
          <span className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
            {app.company}
          </span>
          {/* Priority dot */}
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            title={`Priority: ${app.priority}`}
            style={{ background: priorityColors[app.priority] || "#6B7280" }}
          />
        </div>

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {app.location && (
            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
              <MapPin className="w-3 h-3" />
              {app.location}
            </span>
          )}
          {app.platform && (
            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
              <Send className="w-3 h-3" />
              {app.platform}
            </span>
          )}
          {app.appliedDate && (
            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
              <Clock className="w-3 h-3" />
              {formatRelativeDate(app.appliedDate as unknown as string)}
            </span>
          )}
        </div>
      </div>

      {/* Right: Status + Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <StatusBadge status={app.status} size="sm" />

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--color-secondary)] cursor-pointer"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                className="absolute right-0 top-8 z-10 w-36 rounded-xl shadow-lg overflow-hidden"
                style={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                }}
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  onClick={() => { onSelect(app); setShowMenu(false); }}
                  className="flex items-center gap-2 px-3 py-2.5 text-xs w-full hover:bg-[var(--color-secondary)] transition-colors cursor-pointer"
                  style={{ color: "var(--color-foreground)" }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Details
                </button>
                <button
                  onClick={() => { onArchive(app._id); setShowMenu(false); }}
                  className="flex items-center gap-2 px-3 py-2.5 text-xs w-full hover:bg-[var(--color-secondary)] transition-colors cursor-pointer"
                  style={{ color: "var(--color-foreground)" }}
                >
                  <Archive className="w-3.5 h-3.5" />
                  Archive
                </button>
                <button
                  onClick={() => { onDelete(app._id); setShowMenu(false); }}
                  className="flex items-center gap-2 px-3 py-2.5 text-xs w-full hover:bg-red-500/10 transition-colors text-red-500 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Table View
// ============================================
function TableView({
  applications,
  onDelete,
  onArchive,
  onSelect,
  isDeleting,
}: {
  applications: IApplication[];
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onSelect: (app: IApplication) => void;
  isDeleting: string | null;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--color-border)" }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead
            style={{
              background: "var(--color-secondary)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <tr>
              {["Company", "Role", "Status", "Platform", "Applied", "Priority", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody style={{ background: "var(--color-card)" }}>
            {applications.map((app, i) => (
              <tr
                key={app._id}
                className="transition-colors hover:bg-[var(--color-secondary)]"
                style={{
                  borderTop: i > 0 ? "1px solid var(--color-border)" : undefined,
                  opacity: isDeleting === app._id ? 0.5 : 1,
                }}
              >
                <td className="px-4 py-3 font-medium" style={{ color: "var(--color-foreground)" }}>
                  {app.company}
                </td>
                <td className="px-4 py-3" style={{ color: "var(--color-foreground)" }}>
                  <button onClick={() => onSelect(app)} className="hover:underline text-left cursor-pointer">
                    {app.role}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={app.status} size="sm" />
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                  {app.platform || "—"}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                  {app.appliedDate ? formatDate(app.appliedDate as unknown as string) : "—"}
                </td>
                <td className="px-4 py-3 text-xs capitalize" style={{ color: "var(--color-muted-foreground)" }}>
                  {app.priority}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onArchive(app._id)}
                      className="p-1.5 rounded-lg hover:bg-[var(--color-border)] transition-colors cursor-pointer"
                      title="Archive"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(app._id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-red-500 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// Kanban View
// ============================================
const KANBAN_COLUMNS = [
  { status: "wishlist", label: "Wishlist" },
  { status: "applied", label: "Applied" },
  { status: "interview_scheduled", label: "Interview" },
  { status: "offer", label: "Offer" },
  { status: "rejected", label: "Rejected" },
];

function KanbanView({
  applications,
  onStatusChange,
  onSelect,
}: {
  applications: IApplication[];
  onStatusChange: (id: string, status: string) => void;
  onSelect: (app: IApplication) => void;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map((col) => {
        const colApps = applications.filter((a) => a.status === col.status);
        return (
          <div
            key={col.status}
            className="flex-shrink-0 w-72 rounded-2xl p-3"
            style={{
              background: "var(--color-secondary)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted-foreground)" }}>
                {col.label}
              </h3>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "var(--color-card)", color: "var(--color-muted-foreground)" }}
              >
                {colApps.length}
              </span>
            </div>

            <div className="space-y-2">
              {colApps.map((app) => (
                <div
                  key={app._id}
                  onClick={() => onSelect(app)}
                  className="p-3 rounded-xl cursor-pointer hover:-translate-y-0.5 transition-transform text-left"
                  style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
                >
                  <p className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>
                    {app.company}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-foreground)" }}>
                    {app.role}
                  </p>
                  {app.appliedDate && (
                    <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "var(--color-muted-foreground)" }}>
                      <Calendar className="w-2.5 h-2.5" />
                      {formatDate(app.appliedDate as unknown as string)}
                    </p>
                  )}
                </div>
              ))}

              {colApps.length === 0 && (
                <p className="text-xs text-center py-4" style={{ color: "var(--color-muted-foreground)" }}>
                  No applications
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
