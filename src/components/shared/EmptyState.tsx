"use client";

import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl"
      style={{
        background: "var(--color-card)",
        border: "1px dashed var(--color-border)",
      }}
    >
      {icon && (
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-3xl"
          style={{ background: "var(--color-secondary)" }}
        >
          {icon}
        </div>
      )}
      <h3
        className="text-base font-semibold mb-1"
        style={{ color: "var(--color-foreground)" }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-sm max-w-sm mb-6"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {description}
        </p>
      )}
      {action && action}
    </div>
  );
}
