"use client";

import { Target } from "lucide-react";
import { useDailyTargetStore } from "@/stores/useDailyTargetStore";

export function DailyTargetModal() {
  const open = useDailyTargetStore((s) => s.open);

  return (
    <button
      type="button"
      onClick={() => open("application")}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all hover:bg-[var(--color-secondary)] hover:border-[var(--color-primary)]/30 text-[var(--color-foreground)] border-[var(--color-border)] cursor-pointer active:scale-[0.98]"
      aria-label="Set daily targets"
    >
      <Target className="w-4 h-4 text-[var(--color-primary)]" />
      <span className="hidden sm:inline">Daily Targets</span>
    </button>
  );
}
