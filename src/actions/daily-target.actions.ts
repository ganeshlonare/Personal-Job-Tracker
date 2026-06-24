"use server";

import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import DailyTarget from "@/models/DailyTarget";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import {
  buildTargetItem,
  DAILY_TARGET_CATEGORIES,
  type DailyTargetCategory,
} from "@/lib/dailyTargetConfig";
import Task from "@/models/Task";
import { startOfDay, addDays, endOfDay } from "date-fns";
import { getTodaysApplicationCount } from "@/actions/application.actions";
import { getTodaysColdMailCount } from "@/actions/cold-mail.actions";

export async function getDailyTargets() {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectDB();

  const doc = await DailyTarget.findOne({ userId: session.user.id }).lean();
  return doc ? JSON.parse(JSON.stringify(doc)) : null;
}

export async function updateDailyTargets(
  targets: { title: string; category: string; points: number; _id?: string }[]
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    // Load existing doc so we can detect removed/added targets and ensure subdoc _ids
    const doc = await DailyTarget.findOne({ userId: session.user.id });
    const existing = doc ? doc.targets.map((t: any) => t._id?.toString()).filter(Boolean) : [];

    // sanitize incoming targets: remove any client-local _id values that are not valid ObjectIds
    const sanitizedTargets = (targets || []).map((t) => {
      const copy: any = { ...t };
      if (copy._id && !mongoose.Types.ObjectId.isValid(copy._id)) {
        delete copy._id;
      }
      return copy;
    });

    if (doc) {
      doc.targets = sanitizedTargets as any;
      await doc.save();
    } else {
      await DailyTarget.create({ userId: session.user.id, targets: sanitizedTargets });
    }

    // Reload saved doc to get assigned _ids
    const saved = await DailyTarget.findOne({ userId: session.user.id }).lean();
    const savedIds = saved?.targets?.map((t: any) => t._id?.toString()).filter(Boolean) || [];

    // Detect removed targets and delete future generated tasks for them
    const removed = existing.filter((id: string) => !savedIds.includes(id));
    if (removed.length > 0) {
      const today = startOfDay(new Date());
      await Task.deleteMany({ dailyTargetId: { $in: removed }, userId: session.user.id, date: { $gte: today } });
    }

    // For newly added targets (that weren't in `existing`), if category === 'todo' create tasks for next N days
    const FUTURE_DAYS = 90;
    const addedTargets = (saved?.targets || []).filter((t: any) => {
      const id = t._id?.toString();
      return id && !existing.includes(id) && t.category === "todo";
    });

    if (addedTargets.length > 0) {
      const today = startOfDay(new Date());
      const dates: Date[] = [];
      for (let i = 0; i < FUTURE_DAYS; i++) {
        dates.push(addDays(today, i));
      }

      for (const at of addedTargets) {
        const toCreate: any[] = [];
        // find existing tasks for this dailyTargetId to avoid duplicates
        const existingTasks = await Task.find({ dailyTargetId: at._id?.toString(), userId: session.user.id, date: { $gte: today } }).lean();
        const existingDates = new Set(existingTasks.map((et) => startOfDay(new Date(et.date)).toISOString()));

        for (const d of dates) {
          const key = startOfDay(d).toISOString();
          if (existingDates.has(key)) continue;
          toCreate.push({
            userId: session.user.id,
            title: at.title,
            category: at.category,
            priority: "high",
            points: Number(at.points) || 5,
            date: startOfDay(d),
            isDailyTarget: true,
            dailyTargetId: at._id?.toString(),
            completed: false,
          });
        }

        if (toCreate.length > 0) {
          await Task.insertMany(toCreate);
        }
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/today");
    revalidatePath("/applications");
    revalidatePath("/cold-mails");

    return { success: true };
  } catch (error) {
    console.error("Update daily targets error:", error);
    return { error: "Failed to update daily targets" };
  }
}

export async function upsertCategoryTarget(
  category: DailyTargetCategory,
  count: number
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  if (!Number.isFinite(count) || count < 1 || count > 50) {
    return { error: "Target must be between 1 and 50" };
  }

  try {
    await connectDB();

    const data = await DailyTarget.findOne({ userId: session.user.id }).lean();
    const targets = data?.targets ? [...data.targets] : [];
    const item = buildTargetItem(category, count);
    const idx = targets.findIndex((t) => t.category === category);

    if (idx >= 0) {
      targets[idx] = { ...targets[idx], ...item };
    } else {
      targets.push(item);
    }

    await DailyTarget.findOneAndUpdate(
      { userId: session.user.id },
      { $set: { targets } },
      { upsert: true, new: true }
    );

    revalidatePath("/dashboard");
    revalidatePath("/today");
    revalidatePath("/applications");
    revalidatePath("/cold-mails");

    return { success: true };
  } catch (error) {
    console.error("Upsert category target error:", error);
    return { error: "Failed to save target" };
  }
}

export async function getDailyTargetProgress() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      application: { count: 0, target: null },
      "cold-mail": { count: 0, target: null },
      todo: { count: 0, target: null },
    } as Record<DailyTargetCategory, { count: number; target: number | null }>;
  }

  const [targetsDoc, appCount, mailCount] = await Promise.all([
    getDailyTargets(),
    getTodaysApplicationCount(),
    getTodaysColdMailCount(),
  ]);

  await connectDB();
  const todoCount = await Task.countDocuments({
    userId: session.user.id,
    isDailyTarget: true,
    category: "todo",
    date: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
  });

  const result = {} as Record<
    DailyTargetCategory,
    { count: number; target: number | null }
  >;

  for (const cat of DAILY_TARGET_CATEGORIES) {
    const found = targetsDoc?.targets?.find(
      (t: { category: string }) => t.category === cat
    );
    result[cat] = {
      target: found ? Number(found.points) || null : null,
      count:
        cat === "application"
          ? appCount.count || 0
          : cat === "cold-mail"
          ? mailCount.count || 0
          : todoCount || 0,
    };
  }

  return result;
}
