"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Building2, MapPin, Send, Link2, Mail, Link,
  Clock, Calendar, ExternalLink, Tag, Edit3, Save, X, Trash2,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { updateApplication } from "@/actions/application.actions";
import { APPLICATION_STATUSES, PRIORITIES } from "@/lib/constants";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import type { IApplication } from "@/types";
import { ApplicationEditForm } from "./ApplicationEditForm";
import { useRouter } from "next/navigation";

interface ApplicationDetailClientProps {
  application: IApplication;
  onUpdate?: (updatedApp: IApplication) => void;
}

export function ApplicationDetailClient({ application: initialApp, onUpdate }: ApplicationDetailClientProps) {
  const router = useRouter();
  const [app, setApp] = useState(initialApp);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isEditingAll, setIsEditingAll] = useState(false);
  const [newStatus, setNewStatus] = useState(app.status);
  const [statusNote, setStatusNote] = useState("");

  const cardStyle = {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
  };

  const handleStatusUpdate = async () => {
    const result = await updateApplication(app._id, { status: newStatus, statusNote });
    if (result.success) {
      const updatedApp = {
        ...app,
        status: newStatus as any,
        timeline: [
          ...app.timeline,
          { status: newStatus as any, date: new Date() as any, note: statusNote },
        ],
      };
      setApp(updatedApp);
      setIsEditingStatus(false);
      setStatusNote("");
      if (onUpdate) onUpdate(updatedApp);
      toast.success("Status updated!");
    } else {
      toast.error("Failed to update status");
    }
  };

  if (isEditingAll) {
    return (
      <ApplicationEditForm
        application={app}
        onCancel={() => setIsEditingAll(false)}
        onSuccess={(updatedApp) => {
          setApp(updatedApp);
          setIsEditingAll(false);
          if (onUpdate) onUpdate(updatedApp);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6"
        style={cardStyle}
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Logo */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{
              background: `hsl(${app.company.charCodeAt(0) * 7 % 360}, 65%, 50%)`,
            }}
          >
            {app.company.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--color-foreground)" }}
            >
              {app.role}
            </h1>
            <p
              className="text-base font-medium mt-0.5"
              style={{ color: "var(--color-primary)" }}
            >
              {app.company}
            </p>

            <div className="flex items-center gap-4 mt-2 flex-wrap text-sm" style={{ color: "var(--color-muted-foreground)" }}>
              {app.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {app.location}
                </span>
              )}
              {app.remote && (
                <span className="capitalize px-2 py-0.5 rounded-full text-xs"
                  style={{ background: "var(--color-secondary)" }}
                >
                  {app.remote}
                </span>
              )}
              {app.salaryMin && app.salaryMax && (
                <span>₹{(app.salaryMin / 100000).toFixed(1)}L – ₹{(app.salaryMax / 100000).toFixed(1)}L</span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => setIsEditingAll(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:bg-[var(--color-secondary)]"
              style={{ color: "var(--color-primary)", border: "1px solid var(--color-border)" }}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Application
            </button>
            <div className="flex items-center gap-2">
              <StatusBadge status={app.status} />
              <span
                className="text-xs capitalize px-2 py-0.5 rounded-full hidden sm:inline-block"
                style={{ background: "var(--color-secondary)", color: "var(--color-muted-foreground)" }}
              >
                Priority: {app.priority}
              </span>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex gap-3 mt-4 flex-wrap">
          {app.jobLink && (
            <a
              href={app.jobLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
              style={{ background: "var(--color-secondary)", color: "var(--color-foreground)" }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Job Link
            </a>
          )}
          {app.careerPage && (
            <a
              href={app.careerPage}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
              style={{ background: "var(--color-secondary)", color: "var(--color-foreground)" }}
            >
              <Link2 className="w-3.5 h-3.5" />
              Career Page
            </a>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Update Status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-5"
            style={cardStyle}
          >
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>
              Update Status
            </h2>

            {!isEditingStatus ? (
              <div className="flex items-center gap-3">
                <StatusBadge status={app.status} />
                <button
                  onClick={() => setIsEditingStatus(true)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-[var(--color-secondary)]"
                  style={{ color: "var(--color-primary)" }}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Change Status
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as IApplication["status"])}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: "var(--color-secondary)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-foreground)",
                  }}
                >
                  {APPLICATION_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Add a note (optional)..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{
                    background: "var(--color-secondary)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-foreground)",
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleStatusUpdate}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white"
                    style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
                  >
                    <Save className="w-3.5 h-3.5" />
                    Update
                  </button>
                  <button
                    onClick={() => setIsEditingStatus(false)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-colors hover:bg-[var(--color-secondary)]"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Notes */}
          {app.notes && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-5"
              style={cardStyle}
            >
              <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-foreground)" }}>
                Notes
              </h2>
              <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--color-muted-foreground)" }}>
                {app.notes}
              </p>
            </motion.div>
          )}

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-5"
            style={cardStyle}
          >
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>
              Timeline
            </h2>

            {app.timeline && app.timeline.length > 0 ? (
              <div className="relative">
                <div
                  className="absolute left-3.5 top-0 bottom-0 w-px"
                  style={{ background: "var(--color-border)" }}
                />
                <div className="space-y-4">
                  {[...app.timeline].reverse().map((entry, i) => (
                    <div key={i} className="flex gap-4 relative">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-xs font-bold text-white"
                        style={{
                          background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                        }}
                      >
                        {app.timeline.length - i}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge status={entry.status} size="sm" />
                          <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                            {formatRelativeDate(entry.date as unknown as string)}
                          </span>
                        </div>
                        {entry.note && (
                          <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                No timeline entries yet.
              </p>
            )}
          </motion.div>
        </div>

        {/* Right: Sidebar info */}
        <div className="space-y-6">
          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl p-5"
            style={cardStyle}
          >
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>
              Details
            </h2>

            <div className="space-y-3">
              {[
                {
                  icon: <Send className="w-3.5 h-3.5" />,
                  label: "Platform",
                  value: app.platform || "—",
                },
                {
                  icon: <Calendar className="w-3.5 h-3.5" />,
                  label: "Applied",
                  value: app.appliedDate ? formatDate(app.appliedDate as unknown as string) : "—",
                },
                {
                  icon: <Clock className="w-3.5 h-3.5" />,
                  label: "Deadline",
                  value: app.deadline ? formatDate(app.deadline as unknown as string) : "—",
                },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <span style={{ color: "var(--color-muted-foreground)" }}>{icon}</span>
                  <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                    {label}:
                  </span>
                  <span className="text-xs font-medium ml-auto" style={{ color: "var(--color-foreground)" }}>
                    {value}
                  </span>
                </div>
              ))}

              {/* Tags */}
              {app.tags && app.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {app.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--color-secondary)",
                        color: "var(--color-muted-foreground)",
                      }}
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Recruiter */}
          {(app.recruiterName || app.recruiterEmail) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-5"
              style={cardStyle}
            >
              <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>
                Recruiter
              </h2>
              <div className="space-y-2">
                {app.recruiterName && (
                  <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                    {app.recruiterName}
                  </p>
                )}
                {app.recruiterEmail && (
                  <a
                    href={`mailto:${app.recruiterEmail}`}
                    className="flex items-center gap-1.5 text-xs hover:opacity-70"
                    style={{ color: "var(--color-primary)" }}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {app.recruiterEmail}
                  </a>
                )}
                {app.recruiterLinkedIn && (
                  <a
                    href={app.recruiterLinkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs hover:opacity-70"
                    style={{ color: "var(--color-primary)" }}
                  >
                    <Link className="w-3.5 h-3.5" />
                    LinkedIn Profile
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
