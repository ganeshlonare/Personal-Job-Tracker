"use client";

import { useEffect, useState } from "react";
import { Settings2 } from "lucide-react";
import { getDailyTargets } from "@/actions/daily-target.actions";
import { DAILY_TARGET_META, type DailyTargetCategory } from "@/lib/dailyTargetConfig";
import { useDailyTargetStore } from "@/stores/useDailyTargetStore";

interface Props {
  category: DailyTargetCategory;
  title?: string;
  variant?: "default" | "compact";
}

export default function TargetSetter({
  category,
  title,
  variant = "default",
}: Props) {
  const open = useDailyTargetStore((s) => s.open);
  const [current, setCurrent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const meta = DAILY_TARGET_META[category];
  const label = title || meta.shortLabel;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getDailyTargets()
      .then((data) => {
        if (!mounted) return;
        const found = data?.targets?.find(
          (t: { category: string; points: number }) => t.category === category
        );
        setCurrent(found ? Number(found.points) : null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [category]);

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={() => open(category)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:opacity-90 cursor-pointer active:scale-[0.98]"
        style={{
          background: `${meta.color}18`,
          color: meta.color,
          border: `1px solid ${meta.color}30`,
        }}
      >
        <Settings2 className="w-3 h-3" />
        {loading ? "…" : current !== null ? `${current}/day` : "Set target"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => open(category)}
      className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all hover:bg-[var(--color-secondary)] hover:border-[var(--color-primary)]/25 cursor-pointer active:scale-[0.98]"
      style={{
        color: "var(--color-foreground)",
        borderColor: "var(--color-border)",
        background: "var(--color-card)",
      }}
    >
      <Settings2 className="w-4 h-4" style={{ color: meta.color }} />
      <span>{label}</span>
      <span
        className="text-xs px-2 py-0.5 rounded-md font-semibold"
        style={{
          background: `${meta.color}15`,
          color: meta.color,
        }}
      >
        {loading ? "…" : current !== null ? `${current}/day` : "Set target"}
      </span>
    </button>
  );
}
