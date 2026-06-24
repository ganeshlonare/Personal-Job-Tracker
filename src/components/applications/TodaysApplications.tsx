"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Send, MapPin, Clock, Plus, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatRelativeDate } from "@/lib/utils";
import type { IApplication } from "@/types";

interface TodaysApplicationsProps {
  applications: IApplication[];
  onSelect: (app: IApplication) => void;
}

export function TodaysApplications({
  applications,
  onSelect,
}: TodaysApplicationsProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div>
            <h2
              className="text-lg font-bold"
              style={{ color: "var(--color-foreground)" }}
            >
              Today&apos;s Applications
            </h2>
            <p
              className="text-xs"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {applications.length} sent today
            </p>
          </div>
        </div>
        <Link
          href="/applications/new"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"
          style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </Link>
      </div>

      {applications.length === 0 ? (
        <div
          className="rounded-2xl p-8"
          style={{
            background: "var(--color-card)",
            border: "1px dashed var(--color-border)",
          }}
        >
          <EmptyState
            icon={<Send className="w-6 h-6 text-[var(--color-primary)]" />}
            title="No applications sent today"
            description="Log your first application to start tracking today's progress toward your daily target."
            action={
              <Link
                href="/applications/new"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
                style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
              >
                Add Application
              </Link>
            }
          />
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          {applications.map((app) => (
            <motion.button
              key={app._id}
              type="button"
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: { opacity: 1, y: 0 },
              }}
              onClick={() => onSelect(app)}
              className="text-left p-4 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer card-hover"
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{
                    background: `hsl(${app.company.charCodeAt(0) * 7 % 360}, 65%, 50%)`,
                  }}
                >
                  {app.company.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-sm truncate"
                    style={{ color: "var(--color-foreground)" }}
                  >
                    {app.role}
                  </p>
                  <p
                    className="text-xs font-medium truncate"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {app.company}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <StatusBadge status={app.status} size="sm" />
                    {app.appliedDate && (
                      <span
                        className="flex items-center gap-1 text-[10px]"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        <Clock className="w-3 h-3" />
                        {formatRelativeDate(app.appliedDate as unknown as string)}
                      </span>
                    )}
                    {app.location && (
                      <span
                        className="flex items-center gap-1 text-[10px]"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        <MapPin className="w-3 h-3" />
                        {app.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}
    </section>
  );
}
