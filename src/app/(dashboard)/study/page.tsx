import { auth } from "@/lib/auth";
import { getStudySessions, getStudyStats } from "@/actions/study.actions";
import { StudyClient } from "@/components/study/StudyClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Study Tracker — JobOS" };

export default async function StudyPage() {
  const session = await auth();
  const [sessions, stats] = await Promise.all([
    getStudySessions(),
    session?.user?.id ? getStudyStats(session.user.id) : Promise.resolve({ todayMinutes: 0, todayPomodoros: 0, weekMinutes: 0, monthMinutes: 0, subjectBreakdown: [] }),
  ]);
  return <StudyClient initialSessions={sessions} stats={stats} />;
}
