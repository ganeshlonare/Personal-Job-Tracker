"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard, Target, Send, Building2, Video,
  Code2, FolderKanban, BookOpen, Trophy, Calendar,
  BarChart3, FileText, Archive, Award, PenLine,
  Settings, LogOut, X, Zap, GitBranch, Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/useSidebarStore";
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
  { title: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebarStore();
  const { data: session } = useSession();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={close}
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-72 md:hidden overflow-y-auto"
            style={{
              background: "var(--color-card)",
              borderRight: "1px solid var(--color-border)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between h-16 px-4 border-b"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                  }}
                >
                  J
                </div>
                <span
                  className="font-bold text-base"
                  style={{ color: "var(--color-foreground)" }}
                >
                  JobOS
                </span>
              </div>
              <button
                onClick={close}
                className="p-2 rounded-lg cursor-pointer"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-3 space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm cursor-pointer",
                      isActive ? "font-medium" : ""
                    )}
                    style={{
                      background: isActive
                        ? "var(--color-sidebar-active)"
                        : undefined,
                      color: isActive
                        ? "var(--color-sidebar-active-foreground)"
                        : "var(--color-foreground)",
                    }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom */}
            <div
              className="border-t p-3 mt-2"
              style={{ borderColor: "var(--color-border)" }}
            >
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full transition-colors hover:bg-red-500/10 cursor-pointer"
                style={{ color: "#EF4444" }}
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
