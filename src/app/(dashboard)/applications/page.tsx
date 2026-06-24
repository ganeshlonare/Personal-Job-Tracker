import { Suspense } from "react";
import { getApplications, getTodaysApplications } from "@/actions/application.actions";
import { ApplicationsClient } from "@/components/applications/ApplicationsClient";
import { DashboardSkeleton } from "@/components/shared/LoadingSkeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Applications — JobOS",
  description: "Track all your job applications",
};

export default async function ApplicationsPage() {
  const [applications, todaysApplications] = await Promise.all([
    getApplications(),
    getTodaysApplications(),
  ]);

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ApplicationsClient
        initialApplications={applications}
        initialTodaysApplications={todaysApplications}
      />
    </Suspense>
  );
}
