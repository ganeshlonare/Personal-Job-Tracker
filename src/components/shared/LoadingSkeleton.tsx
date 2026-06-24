"use client";

export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <LoadingSkeleton className="h-20 w-full rounded-2xl" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <LoadingSkeleton className="h-48 rounded-2xl" />
          <LoadingSkeleton className="h-64 rounded-2xl" />
        </div>
        <div className="space-y-6">
          <LoadingSkeleton className="h-36 rounded-2xl" />
          <LoadingSkeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
