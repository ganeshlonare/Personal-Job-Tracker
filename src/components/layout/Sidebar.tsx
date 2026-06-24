"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard, Target, Send, Building2, Video,
  Code2, FolderKanban, BookOpen, Trophy, Calendar,
  BarChart3, FileText, Archive, Award, PenLine,
  Settings, LogOut, ChevronLeft, ChevronRight,
  Command, Zap, GitBranch, Mail
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useCommandStore } from "@/stores/useCommandStore";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Activity Timeline", href: "/timeline", icon: Zap },
  { title: "Today's Mission", href: "/today", icon: Target },
  { title: "Applications", href: "/applications", icon: Send },
  { title: "Cold Mails", href: "/cold-mails", icon: Mail },
  { title: "Companies", href: "/companies", icon: Building2 },
  { title: "Interviews", href: "/interviews", icon: Video },
  { title: "LeetCode", href: "/leetcode", icon: Code2 },
  { title: "GitHub", href: "/github", icon: GitBranch },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Study Tracker", href: "/study", icon: BookOpen },
  { title: "Goals", href: "/goals", icon: Trophy },
  { title: "Calendar", href: "/calendar", icon: Calendar },
  // { title: "Analytics", href: "/analytics", icon: BarChart3 },
  // { title: "Resume Manager", href: "/resumes", icon: FileText },
  // { title: "Documents", href: "/documents", icon: Archive },
  // { title: "Achievements", href: "/achievements", icon: Award },
  // { title: "Journal", href: "/journal", icon: PenLine },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse, close } = useSidebarStore();
  const { open: openCommand } = useCommandStore();
  const { data: session } = useSession();

  const user = session?.user;

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="hidden md:flex flex-col h-screen sticky top-0 border-r flex-shrink-0 overflow-hidden"
      style={{
        background: "var(--color-sidebar-bg)",
        borderColor: "var(--color-sidebar-border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center h-16 px-4 border-b flex-shrink-0"
        style={{ borderColor: "var(--color-sidebar-border)" }}
      >
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2.5 flex-1 min-w-0"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                }}
              >
                J
              </div>
              <div className="min-w-0">
                <span
                  className="font-bold text-base tracking-tight block"
                  style={{ color: "var(--color-foreground)" }}
                >
                  JobOS
                </span>
                <span
                  className="text-xs truncate block"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  Job Search OS
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isCollapsed && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm mx-auto"
            style={{
              background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
            }}
          >
            J
          </div>
        )}

        {!isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="ml-auto p-1.5 rounded-lg transition-colors hover:bg-[var(--color-sidebar-hover)] cursor-pointer"
            style={{ color: "var(--color-muted-foreground)" }}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Command palette shortcut */}
      {!isCollapsed && (
        <div className="px-3 py-2">
          <button
            onClick={openCommand}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-150 cursor-pointer"
            style={{
              background: "var(--color-sidebar-hover)",
              color: "var(--color-muted-foreground)",
              border: "1px solid var(--color-sidebar-border)",
            }}
          >
            <Command className="w-3.5 h-3.5" />
            <span className="flex-1 text-left">Quick search...</span>
            <span className="text-xs opacity-60">⌘K</span>
          </button>
        </div>
      )}

      {isCollapsed && (
        <div className="px-2 py-2">
          <button
            onClick={toggleCollapse}
            className="w-full p-2 rounded-lg transition-colors hover:bg-[var(--color-sidebar-hover)] flex justify-center cursor-pointer"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => close()}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative cursor-pointer",
                isActive
                  ? "font-medium"
                  : "hover:bg-[var(--color-sidebar-hover)]"
              )}
              style={{
                background: isActive
                  ? "var(--color-sidebar-active)"
                  : undefined,
                color: isActive
                  ? "var(--color-sidebar-active-foreground)"
                  : "var(--color-sidebar-foreground)",
              }}
              title={isCollapsed ? item.title : undefined}
            >
              <Icon
                className={cn(
                  "flex-shrink-0 transition-all duration-150",
                  isCollapsed ? "w-5 h-5 mx-auto" : "w-4 h-4"
                )}
              />
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm truncate"
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{
                    background: "var(--color-sidebar-active-foreground)",
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div
        className="mx-3 my-1 border-t"
        style={{ borderColor: "var(--color-sidebar-border)" }}
      />

      {/* Settings link */}
      <div className="px-2 pb-2">
        <Link
          href="/settings"
          onClick={() => close()}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer",
            pathname === "/settings"
              ? "font-medium"
              : "hover:bg-[var(--color-sidebar-hover)]"
          )}
          style={{
            background:
              pathname === "/settings"
                ? "var(--color-sidebar-active)"
                : undefined,
            color:
              pathname === "/settings"
                ? "var(--color-sidebar-active-foreground)"
                : "var(--color-sidebar-foreground)",
          }}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings
            className={cn(
              "flex-shrink-0 w-4 h-4",
              isCollapsed && "w-5 h-5 mx-auto"
            )}
          />
          {!isCollapsed && <span className="text-sm">Settings</span>}
        </Link>
      </div>

      {/* User profile */}
      <div
        className="border-t p-3"
        style={{ borderColor: "var(--color-sidebar-border)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #6366F1 0%, #EC4899 100%)",
            }}
          >
            {user?.name ? getInitials(user.name) : "U"}
          </div>

          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 min-w-0"
              >
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: "var(--color-foreground)" }}
                >
                  {user?.name || "User"}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  {user?.email || ""}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!isCollapsed && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
              style={{ color: "var(--color-muted-foreground)" }}
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}

          {isCollapsed && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-500 mx-auto"
              style={{ color: "var(--color-muted-foreground)" }}
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Score badge */}
        {!isCollapsed && (
          <div
            className="mt-3 p-2 rounded-lg flex items-center gap-2"
            style={{ background: "var(--color-sidebar-hover)" }}
          >
            <Zap className="w-3.5 h-3.5 text-yellow-500" />
            <span
              className="text-xs"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              Today&apos;s Score:
            </span>
            <span
              className="text-xs font-bold ml-auto"
              style={{ color: "var(--color-foreground)" }}
            >
              0 pts
            </span>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
