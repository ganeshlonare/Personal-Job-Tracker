import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getTimelineData } from "@/actions/timeline.actions";
import { TimelineClient } from "@/components/timeline/TimelineClient";
import { PageHeader } from "@/components/shared/PageHeader";
import { Loader2 } from "lucide-react";
import type { Metadata } from "next";
import { TimelineDownloadButton } from "@/components/timeline/TimelineDownloadButton";

export const metadata: Metadata = {
  title: "Activity Timeline — JobOS",
  description: "Your daily activity timeline",
};

export default async function TimelinePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const data = await getTimelineData(session.user.id);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Activity Timeline" 
        description="Track your daily progress since you joined JobOS"
        actions={<TimelineDownloadButton data={data} />}
      />
      <Suspense fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
        <TimelineClient data={data} />
      </Suspense>
    </div>
  );
}
