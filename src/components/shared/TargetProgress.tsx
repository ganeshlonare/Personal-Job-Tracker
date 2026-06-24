"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { getDailyTargetProgress } from "@/actions/daily-target.actions";
import { DAILY_TARGET_META, type DailyTargetCategory } from "@/lib/dailyTargetConfig";

interface Props {
  category: DailyTargetCategory;
  title?: string;
}

export default function TargetProgress({ category, title }: Props) {
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<number | null>(null);
  const [count, setCount] = useState(0);

  const meta = DAILY_TARGET_META[category];
  const label = title || meta.shortLabel;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getDailyTargetProgress()
      .then((prog) => {
        if (!mounted) return;
        setTarget(prog[category].target);
        setCount(prog[category].count);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [category]);

  if (loading) {
    return (
      <div
        className="h-9 w-32 rounded-xl animate-pulse"
        style={{ background: "var(--color-secondary)" }}
      />
    );
  }

  if (!target || target <= 0) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
        style={{
          background: "var(--color-secondary)",
          color: "var(--color-muted-foreground)",
          border: "1px solid var(--color-border)",
        }}
      >
        No {label.toLowerCase()} target set
      </div>
    );
  }

  const done = count >= target;
  const pct = Math.min(100, Math.round((count / target) * 100));

  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-xl min-w-[180px]"
      style={{
        background: done ? "rgba(34,197,94,0.08)" : "var(--color-card)",
        border: done
          ? "1px solid rgba(34,197,94,0.25)"
          : "1px solid var(--color-border)",
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span
            className="text-[10px] font-bold uppercase tracking-wide truncate"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {label} today
          </span>
          {done && (
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)] flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-bold tabular-nums"
            style={{
              color: done ? "var(--color-success)" : meta.color,
            }}
          >
            {count}/{target}
          </span>
          <div
            className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ background: "var(--color-secondary)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: done ? "var(--color-success)" : meta.gradient,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
