import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getDashboardData } from "@/actions/dashboard.actions";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardSkeleton } from "@/components/shared/LoadingSkeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — JobOS",
  description: "Your job search command center",
};

export default async function DashboardPage() {
  const session = await auth();
  const [data] = await Promise.all([
    getDashboardData(),
  ]);

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent
        userName={session?.user?.name || ""}
        data={data}
      />
    </Suspense>
  );
}
