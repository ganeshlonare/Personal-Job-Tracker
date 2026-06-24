"use client";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: { label: string; count: number };
}

export function PageHeader({ title, description, actions, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--color-foreground)" }}
          >
            {title}
          </h1>
          {badge && (
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{
                background: "var(--color-secondary)",
                color: "var(--color-muted-foreground)",
              }}
            >
              {badge.count}
            </span>
          )}
        </div>
        {description && (
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
