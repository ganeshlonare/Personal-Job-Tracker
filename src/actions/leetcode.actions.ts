"use server";

import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Leetcode from "@/models/Leetcode";
import DailyScore from "@/models/DailyScore";
import { revalidatePath } from "next/cache";
import { startOfDay } from "date-fns";
import { calculateLeetcodeScore } from "@/lib/scoring";
import mongoose from "mongoose";

export async function getLeetcodeProblems(filters?: {
  difficulty?: string;
  status?: string;
  topic?: string;
  bookmarked?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) return [];

  await connectDB();

  const query: Record<string, unknown> = { userId: session.user.id };

  if (filters?.difficulty && filters.difficulty !== "all") query.difficulty = filters.difficulty;
  if (filters?.status && filters.status !== "all") query.status = filters.status;
  if (filters?.topic && filters.topic !== "all") query.topic = { $in: [filters.topic] };
  if (filters?.bookmarked) query.bookmarked = true;

  const problems = await Leetcode.find(query).sort({ solvedDate: -1 }).lean();
  return JSON.parse(JSON.stringify(problems));
}

export async function getLeetcodeStats(userId: string) {
  await connectDB();

  const uid = new mongoose.Types.ObjectId(userId);
  const stats = await Leetcode.aggregate([
    { $match: { userId: uid } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        easy: { $sum: { $cond: [{ $eq: ["$difficulty", "easy"] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: ["$difficulty", "medium"] }, 1, 0] } },
        hard: { $sum: { $cond: [{ $eq: ["$difficulty", "hard"] }, 1, 0] } },
        solved: { $sum: { $cond: [{ $eq: ["$status", "solved"] }, 1, 0] } },
        needsRevision: { $sum: { $cond: ["$revisionRequired", 1, 0] } },
      },
    },
  ]);

  // Topic breakdown
  const topicBreakdown = await Leetcode.aggregate([
    { $match: { userId: uid } },
    { $unwind: "$topic" },
    { $group: { _id: "$topic", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  return {
    stats: stats[0] || { total: 0, easy: 0, medium: 0, hard: 0, solved: 0, needsRevision: 0 },
    topicBreakdown: topicBreakdown.map((t) => ({ topic: t._id, count: t.count })),
  };
}

export async function createLeetcodeProblem(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();

    const problem = await Leetcode.create({
      ...data,
      userId: session.user.id,
      solvedDate: (data.solvedDate as Date) || new Date(),
      topic: Array.isArray(data.topic) ? data.topic : [],
    });

    // Award points
    const points = calculateLeetcodeScore(data.difficulty as "easy" | "medium" | "hard");
    const today = startOfDay(new Date());

    await DailyScore.findOneAndUpdate(
      { userId: session.user.id, date: today },
      {
        $inc: { score: points, "breakdown.leetcode": points },
        $setOnInsert: { userId: session.user.id, date: today },
      },
      { upsert: true }
    );

    revalidatePath("/leetcode");
    revalidatePath("/dashboard");

    return { success: true, id: problem._id.toString() };
  } catch (error) {
    console.error("Create leetcode error:", error);
    return { error: "Failed to add problem" };
  }
}

export async function updateLeetcodeProblem(id: string, data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    await Leetcode.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: data }
    );

    revalidatePath("/leetcode");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update" };
  }
}

export async function deleteLeetcodeProblem(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    await Leetcode.findOneAndDelete({ _id: id, userId: session.user.id });

    revalidatePath("/leetcode");
    return { success: true };
  } catch {
    return { error: "Failed to delete" };
  }
}
