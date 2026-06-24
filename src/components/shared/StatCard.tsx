"use client";

import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconBg?: string;
  trend?: { value: number; label: string };
  color?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBg = "bg-indigo-500/10",
  trend,
  color = "#6366F1",
}: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 cursor-default"
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-medium uppercase tracking-wider mb-1"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {title}
          </p>
          <p
            className="text-2xl font-bold leading-none mb-1"
            style={{ color: "var(--color-foreground)" }}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className="text-xs"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              <span
                className="text-xs font-medium"
                style={{
                  color: trend.value >= 0 ? "#22C55E" : "#EF4444",
                }}
              >
                {trend.value >= 0 ? "+" : ""}
                {trend.value}%
              </span>
              <span
                className="text-xs"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                {trend.label}
              </span>
            </div>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
          style={{ color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
