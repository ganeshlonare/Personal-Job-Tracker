import { getTasks } from "@/actions/task.actions";
import { TodayClient } from "@/components/today/TodayClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Today's Mission — JobOS",
  description: "Your daily task planner",
};

export const dynamic = 'force-dynamic';

export default async function TodayPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const resolvedParams = await searchParams;
  let targetDate = new Date();
  if (resolvedParams?.date) {
    // "2026-06-24" -> parse as local time to prevent off-by-one errors
    const parsed = new Date(resolvedParams.date + "T00:00:00");
    if (!isNaN(parsed.getTime())) {
      targetDate = parsed;
    }
  }

  const tasks = await getTasks(targetDate);
  return <TodayClient key={targetDate.toISOString()} initialTasks={tasks} initialDate={targetDate.toISOString()} />;
}
