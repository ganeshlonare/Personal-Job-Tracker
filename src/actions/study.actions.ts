"use server";

import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import StudySession from "@/models/StudySession";
import DailyScore from "@/models/DailyScore";
import { revalidatePath } from "next/cache";
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth } from "date-fns";
import { calculateStudyScore } from "@/lib/scoring";
import mongoose from "mongoose";

export async function getStudySessions(filters?: { subject?: string; dateFrom?: Date; dateTo?: Date }) {
  const session = await auth();
  if (!session?.user?.id) return [];

  await connectDB();

  const query: Record<string, unknown> = { userId: session.user.id };
  if (filters?.subject && filters.subject !== "all") query.subject = filters.subject;
  if (filters?.dateFrom || filters?.dateTo) {
    query.date = {};
    if (filters.dateFrom) (query.date as Record<string, unknown>).$gte = filters.dateFrom;
    if (filters.dateTo) (query.date as Record<string, unknown>).$lte = filters.dateTo;
  }

  const sessions = await StudySession.find(query).sort({ date: -1 }).lean();
  return JSON.parse(JSON.stringify(sessions));
}

export async function getStudyStats(userId: string) {
  await connectDB();

  const uid = new mongoose.Types.ObjectId(userId);
  const now = new Date();

  const [todayStats, weekStats, monthStats, subjectBreakdown] = await Promise.all([
    StudySession.aggregate([
      { $match: { userId: uid, date: { $gte: startOfDay(now), $lte: endOfDay(now) } } },
      { $group: { _id: null, total: { $sum: "$duration" }, pomodoros: { $sum: "$pomodoroCount" } } },
    ]),
    StudySession.aggregate([
      { $match: { userId: uid, date: { $gte: startOfWeek(now), $lte: endOfWeek(now) } } },
      { $group: { _id: null, total: { $sum: "$duration" } } },
    ]),
    StudySession.aggregate([
      { $match: { userId: uid, date: { $gte: startOfMonth(now), $lte: endOfMonth(now) } } },
      { $group: { _id: null, total: { $sum: "$duration" } } },
    ]),
    StudySession.aggregate([
      { $match: { userId: uid } },
      { $group: { _id: "$subject", totalMinutes: { $sum: "$duration" }, sessions: { $sum: 1 } } },
      { $sort: { totalMinutes: -1 } },
    ]),
  ]);

  return {
    todayMinutes: todayStats[0]?.total || 0,
    todayPomodoros: todayStats[0]?.pomodoros || 0,
    weekMinutes: weekStats[0]?.total || 0,
    monthMinutes: monthStats[0]?.total || 0,
    subjectBreakdown: subjectBreakdown.map((s) => ({
      subject: s._id,
      minutes: s.totalMinutes,
      sessions: s.sessions,
    })),
  };
}

export async function createStudySession(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();

    const studySession = await StudySession.create({
      ...data,
      userId: session.user.id,
      date: (data.date as Date) || new Date(),
    });

    // Award points
    const hours = (data.duration as number) / 60;
    const points = calculateStudyScore(hours);
    const today = startOfDay(new Date());

    await DailyScore.findOneAndUpdate(
      { userId: session.user.id, date: today },
      {
        $inc: { score: points, "breakdown.study": points },
        $setOnInsert: { userId: session.user.id, date: today },
      },
      { upsert: true }
    );

    const { updateUserActivity } = await import("@/actions/auth.actions");
    await updateUserActivity(session.user.id);

    revalidatePath("/study");
    revalidatePath("/dashboard");
    return { success: true, id: studySession._id.toString() };
  } catch (error) {
    console.error("Create study session error:", error);
    return { error: "Failed to log session" };
  }
}

export async function deleteStudySession(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    await StudySession.findOneAndDelete({ _id: id, userId: session.user.id });

    revalidatePath("/study");
    return { success: true };
  } catch {
    return { error: "Failed to delete" };
  }
}
