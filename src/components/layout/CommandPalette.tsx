"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Command,
  LayoutDashboard, Target, Send, Building2, Video,
  Code2, FolderKanban, BookOpen, Trophy, Calendar,
  BarChart3, FileText, Archive, Award, PenLine, Settings, X, GitBranch
} from "lucide-react";
import { useCommandStore } from "@/stores/useCommandStore";
import { motion, AnimatePresence } from "framer-motion";

const COMMANDS = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, category: "Navigation" },
  { title: "Today's Mission", href: "/today", icon: Target, category: "Navigation" },
  { title: "Applications", href: "/applications", icon: Send, category: "Navigation" },
  { title: "New Application", href: "/applications/new", icon: Send, category: "Quick Actions" },
  { title: "Companies", href: "/companies", icon: Building2, category: "Navigation" },
  { title: "Interviews", href: "/interviews", icon: Video, category: "Navigation" },
  { title: "LeetCode", href: "/leetcode", icon: Code2, category: "Navigation" },
  { title: "GitHub", href: "/github", icon: GitBranch, category: "Navigation" },
  { title: "Projects", href: "/projects", icon: FolderKanban, category: "Navigation" },
  { title: "Study Tracker", href: "/study", icon: BookOpen, category: "Navigation" },
  { title: "Goals", href: "/goals", icon: Trophy, category: "Navigation" },
  { title: "Calendar", href: "/calendar", icon: Calendar, category: "Navigation" },
  // { title: "Analytics", href: "/analytics", icon: BarChart3, category: "Navigation" },
  { title: "Resume Manager", href: "/resumes", icon: FileText, category: "Navigation" },
  { title: "Documents", href: "/documents", icon: Archive, category: "Navigation" },
  // { title: "Achievements", href: "/achievements", icon: Award, category: "Navigation" },
  // { title: "Journal", href: "/journal", icon: PenLine, category: "Navigation" },
  { title: "Settings", href: "/settings", icon: Settings, category: "Navigation" },
];

export function CommandPalette() {
  const { isOpen, close } = useCommandStore();
  const router = useRouter();

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) close();
        else useCommandStore.getState().open();
      }
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={close}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            {/* Search input */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 border-b"
              style={{ borderColor: "var(--color-border)" }}
            >
              <Command
                className="w-4 h-4 flex-shrink-0"
                style={{ color: "var(--color-muted-foreground)" }}
              />
              <input
                id="command-input"
                type="text"
                placeholder="Search pages, actions..."
                autoFocus
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: "var(--color-foreground)" }}
              />
              <button
                onClick={close}
                className="p-1 rounded-md transition-colors hover:bg-[var(--color-secondary)]"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Command list */}
            <div className="max-h-80 overflow-y-auto p-2">
              {Object.entries(
                COMMANDS.reduce(
                  (groups, cmd) => {
                    if (!groups[cmd.category]) groups[cmd.category] = [];
                    groups[cmd.category].push(cmd);
                    return groups;
                  },
                  {} as Record<string, typeof COMMANDS>
                )
              ).map(([category, items]) => (
                <div key={category} className="mb-2">
                  <p
                    className="px-2 py-1 text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {category}
                  </p>
                  <div className="space-y-0.5">
                    {items.map((cmd) => {
                      const Icon = cmd.icon;
                      return (
                        <Link
                          key={cmd.href}
                          href={cmd.href}
                          onClick={close}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 hover:bg-[var(--color-secondary)]"
                          style={{ color: "var(--color-foreground)" }}
                        >
                          <Icon
                            className="w-4 h-4 flex-shrink-0"
                            style={{ color: "var(--color-muted-foreground)" }}
                          />
                          {cmd.title}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div
              className="px-4 py-2.5 border-t flex items-center gap-4 text-xs"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-muted-foreground)",
                background: "var(--color-secondary)",
              }}
            >
              <span>↑↓ to navigate</span>
              <span>↵ to select</span>
              <span>esc to close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
