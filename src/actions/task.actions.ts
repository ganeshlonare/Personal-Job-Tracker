"use server";

import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Task from "@/models/Task";
import DailyScore from "@/models/DailyScore";
import { revalidatePath } from "next/cache";
import { startOfDay, endOfDay } from "date-fns";
import { getLocalDayBounds } from "@/lib/utils";

import DailyTarget from "@/models/DailyTarget";
import {
  DAILY_TARGET_META,
  type DailyTargetCategory,
} from "@/lib/dailyTargetConfig";

export async function getTasks(date?: Date) {
  const session = await auth();
  if (!session?.user?.id) return [];

  await connectDB();

  const targetDate = date || new Date();
  const { start: dayStart, end: dayEnd } = getLocalDayBounds(targetDate);

  // Auto-generate & sync daily target tasks for this date
  const dailyTargetDoc = await DailyTarget.findOne({ userId: session.user.id });
  if (dailyTargetDoc && dailyTargetDoc.targets.length > 0) {
    const existingGeneratedTasks = await Task.find({
      userId: session.user.id,
      date: { $gte: dayStart, $lte: dayEnd },
      isDailyTarget: true,
    });

    const existingByTargetId = new Map(
      existingGeneratedTasks.map((t) => [t.dailyTargetId, t])
    );

    const tasksToCreate: Record<string, unknown>[] = [];

    for (const target of dailyTargetDoc.targets) {
      const targetId = target._id?.toString();
      if (!targetId) continue;

      const meta =
        DAILY_TARGET_META[target.category as DailyTargetCategory];
      const count = Number(target.points) || 0;
      const title =
        target.title ||
        meta?.buildTitle(count) ||
        `Complete daily ${target.category} target`;
      const taskPoints = meta?.taskPoints ?? 5;
      const existing = existingByTargetId.get(targetId);

      if (existing) {
        if (
          existing.title !== title ||
          existing.points !== taskPoints ||
          existing.category !== target.category
        ) {
          await Task.findByIdAndUpdate(existing._id, {
            title,
            points: taskPoints,
            category: target.category,
          });
        }
      } else {
        tasksToCreate.push({
          userId: session.user!.id,
          title,
          category: target.category,
          priority: "high",
          points: taskPoints,
          date: dayStart,
          isDailyTarget: true,
          dailyTargetId: targetId,
          completed: false,
        });
      }
    }

    if (tasksToCreate.length > 0) {
      await Task.insertMany(tasksToCreate);
    }
  }

  const tasks = await Task.find({
    userId: session.user.id,
    date: {
      $gte: dayStart,
      $lte: dayEnd,
    },
  })
    .sort({ completed: 1, priority: -1 })
    .lean();

  return JSON.parse(JSON.stringify(tasks));
}

export async function createTask(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();

    const task = await Task.create({
      ...data,
      userId: session.user.id,
      date: (data.date as Date) || new Date(),
    });

    revalidatePath("/today");
    revalidatePath("/dashboard");

    return { success: true, id: task._id.toString() };
  } catch (error) {
    console.error("Create task error:", error);
    return { error: "Failed to create task" };
  }
}

export async function toggleTask(id: string, completed: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      {
        $set: {
          completed,
          completedAt: completed ? new Date() : null,
        },
      },
      { new: true }
    );

    if (!task) return { error: "Task not found" };

    // Update daily score
    await updateDailyScore(session.user.id, task.points, completed);
    
    if (completed) {
      const { updateUserActivity } = await import("@/actions/auth.actions");
      await updateUserActivity(session.user.id);
    }

    revalidatePath("/today");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Toggle task error:", error);
    return { error: "Failed to update task" };
  }
}

export async function deleteTask(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    await Task.findOneAndDelete({ _id: id, userId: session.user.id });

    revalidatePath("/today");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Delete task error:", error);
    return { error: "Failed to delete task" };
  }
}

async function updateDailyScore(userId: string, points: number, add: boolean) {
  const { start: today } = getLocalDayBounds(new Date());
  const delta = add ? points : -points;

  await DailyScore.findOneAndUpdate(
    { userId, date: today },
    {
      $inc: {
        score: delta,
        [`breakdown.other`]: delta,
      },
      $setOnInsert: { userId, date: today },
    },
    { upsert: true, new: true }
  );
}

export async function updateTask(id: string, data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    const task = await Task.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: data },
      { new: true }
    );

    if (!task) return { error: "Task not found" };

    revalidatePath("/today");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Update task error:", error);
    return { error: "Failed to update task" };
  }
}
