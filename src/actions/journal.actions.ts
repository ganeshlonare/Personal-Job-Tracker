"use server";

import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Journal from "@/models/Journal";
import { revalidatePath } from "next/cache";
import { startOfDay, endOfDay } from "date-fns";

export async function getJournals() {
  const session = await auth();
  if (!session?.user?.id) return [];

  await connectDB();
  const journals = await Journal.find({ userId: session.user.id })
    .sort({ date: -1 })
    .lean();
  return JSON.parse(JSON.stringify(journals));
}

export async function getTodayJournal() {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectDB();
  const today = new Date();
  const journal = await Journal.findOne({
    userId: session.user.id,
    date: { $gte: startOfDay(today), $lte: endOfDay(today) },
  }).lean();

  if (!journal) return null;
  return JSON.parse(JSON.stringify(journal));
}

export async function upsertJournal(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();

    const date = data.date ? new Date(data.date as string) : new Date();

    const journal = await Journal.findOneAndUpdate(
      { userId: session.user.id, date: { $gte: startOfDay(date), $lte: endOfDay(date) } },
      { $set: { ...data, userId: session.user.id, date } },
      { upsert: true, new: true }
    );

    revalidatePath("/journal");
    revalidatePath("/dashboard");
    return { success: true, id: journal._id.toString() };
  } catch (error) {
    console.error("Upsert journal error:", error);
    return { error: "Failed to save journal" };
  }
}
