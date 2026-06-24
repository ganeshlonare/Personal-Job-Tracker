"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Search, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useCommandStore } from "@/stores/useCommandStore";
import { getInitials } from "@/lib/utils";
import { SIDEBAR_ITEMS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { getUpcomingCalendarEvents } from "@/actions/calendar.actions";
import { DailyTargetModal } from "./DailyTargetModal";

// Map icon names to page titles
const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/today": "Today's Mission",
  "/applications": "Applications",
  "/cold-mails": "Cold Mails",
  "/companies": "Companies",
  "/interviews": "Interviews",
  "/leetcode": "LeetCode",
  "/projects": "Projects",
  "/study": "Study Tracker",
  "/goals": "Goals",
  "/calendar": "Calendar",
  "/analytics": "Analytics",
  // "/resumes": "Resume Manager",
  // "/documents": "Documents",
  "/achievements": "Achievements",
  "/journal": "Journal",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];

  // Match by prefix
  const match = Object.entries(PAGE_TITLES).find(
    ([key]) => key !== "/" && pathname.startsWith(key)
  );
  return match ? match[1] : "JobOS";
}

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch notifications on mount and whenever page changes (so new events show instantly)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const events = await getUpcomingCalendarEvents();
        setNotifications(events || []);
      } catch { /* silent */ }
    };
    fetchNotifications();
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifications]);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const { toggle: toggleSidebar, isOpen } = useSidebarStore();
  const { open: openCommand } = useCommandStore();

  const pageTitle = getPageTitle(pathname);
  const user = session?.user;

  return (
    <header
      className="h-16 flex items-center gap-4 px-4 md:px-6 border-b sticky top-0 z-30 flex-shrink-0"
      style={{
        background: "var(--color-background)",
        borderColor: "var(--color-border)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Mobile menu toggle */}
      <button
        id="mobile-menu-toggle"
        onClick={toggleSidebar}
        className="md:hidden p-2 rounded-lg transition-colors hover:bg-[var(--color-secondary)] cursor-pointer"
        style={{ color: "var(--color-foreground)" }}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Page title */}
      <h1
        className="text-base font-semibold flex-1 md:flex-none"
        style={{ color: "var(--color-foreground)" }}
      >
        {pageTitle}
      </h1>

      <div className="flex-1 hidden md:block" />

      {/* Search button */}
      <button
        id="header-search"
        onClick={openCommand}
        className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer"
        style={{
          background: "var(--color-secondary)",
          color: "var(--color-muted-foreground)",
          border: "1px solid var(--color-border)",
          minWidth: "200px",
        }}
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search...</span>
        <span className="text-xs opacity-60">⌘K</span>
      </button>

      {/* Mobile search icon */}
      <button
        onClick={openCommand}
        className="md:hidden p-2 rounded-lg transition-colors hover:bg-[var(--color-secondary)] cursor-pointer"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        <Search className="w-5 h-5" />
      </button>

      <DailyTargetModal />

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          id="header-notifications"
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 rounded-lg transition-colors hover:bg-[var(--color-secondary)] cursor-pointer"
          style={{ color: "var(--color-muted-foreground)" }}
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {notifications.length > 0 && (
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: "#6366F1" }}
              aria-hidden="true"
            />
          )}
        </button>

        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-72 rounded-xl overflow-hidden shadow-xl z-50 border border-[var(--color-border)]"
              style={{ background: "var(--color-card)" }}
            >
              <div className="p-3 border-b border-[var(--color-border)] font-semibold text-sm" style={{ color: "var(--color-foreground)" }}>
                Upcoming Events
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((event, idx) => (
                    <div key={idx} className="p-3 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-secondary)] transition-colors">
                      <div className="text-xs font-semibold mb-1 truncate" style={{ color: "var(--color-foreground)" }}>{event.title}</div>
                      <div className="text-[10px] flex justify-between" style={{ color: "var(--color-muted-foreground)" }}>
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                        <span>{event.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                    No upcoming events
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Theme toggle */}
      <button
        id="header-theme-toggle"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="p-2 rounded-lg transition-colors hover:bg-[var(--color-secondary)] cursor-pointer"
        style={{ color: "var(--color-muted-foreground)" }}
        aria-label="Toggle theme"
      >
        {mounted ? (
          theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )
        ) : (
          <div className="w-5 h-5" />
        )}
      </button>

      {/* User avatar */}
      <Link
        href="/settings"
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white transition-opacity hover:opacity-80 cursor-pointer"
        style={{
          background: "linear-gradient(135deg, #6366F1 0%, #EC4899 100%)",
        }}
      >
        {user?.name ? getInitials(user.name) : "U"}
      </Link>
    </header>
  );
}
