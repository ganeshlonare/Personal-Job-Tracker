"use client";

import Link from "next/link";
import { Send, Building2, BookOpen, Video, PenLine, Code2 } from "lucide-react";

const QUICK_ACTIONS = [
  {
    label: "Apply",
    href: "/applications/new",
    icon: Send,
    color: "#3B82F6",
    bg: "bg-blue-500/10",
  },
  {
    label: "Add Company",
    href: "/companies",
    icon: Building2,
    color: "#10B981",
    bg: "bg-green-500/10",
  },
  {
    label: "Study Session",
    href: "/study",
    icon: BookOpen,
    color: "#8B5CF6",
    bg: "bg-purple-500/10",
  },
  {
    label: "Add Interview",
    href: "/interviews",
    icon: Video,
    color: "#EC4899",
    bg: "bg-pink-500/10",
  },
  {
    label: "LeetCode",
    href: "/leetcode",
    icon: Code2,
    color: "#F59E0B",
    bg: "bg-yellow-500/10",
  },
  // {
  //   label: "Journal",
  //   href: "/journal",
  //   icon: PenLine,
  //   color: "#06B6D4",
  //   bg: "bg-cyan-500/10",
  // },
];

export function QuickActions() {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <h3
        className="font-semibold mb-4"
        style={{ color: "var(--color-foreground)" }}
      >
        Quick Actions
      </h3>

      <div className="grid grid-cols-3 gap-2">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-150 hover:scale-105 ${action.bg}`}
              style={{ color: action.color }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium text-center leading-tight" style={{ color: "var(--color-foreground)" }}>
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
