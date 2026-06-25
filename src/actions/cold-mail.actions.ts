"use server";

import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import ColdMail from "@/models/ColdMail";
import { revalidatePath } from "next/cache";
import { getLocalDayBounds } from "@/lib/utils";

export async function getColdMails() {
  const session = await auth();
  if (!session?.user?.id) return [];

  await connectDB();
  const mails = await ColdMail.find({ userId: session.user.id })
    .sort({ date: -1, createdAt: -1 })
    .lean();
    
  return JSON.parse(JSON.stringify(mails));
}

export async function createColdMail(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    const mail = await ColdMail.create({ ...data, userId: session.user.id });
    revalidatePath("/cold-mails");
    revalidatePath("/dashboard");
    revalidatePath("/timeline");
    return { success: true, id: mail._id.toString() };
  } catch (error) {
    return { error: "Failed to log cold mail" };
  }
}

export async function updateColdMail(id: string, data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    await ColdMail.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: data }
    );
    revalidatePath("/cold-mails");
    revalidatePath("/dashboard");
    revalidatePath("/timeline");
    return { success: true };
  } catch {
    return { error: "Failed to update cold mail" };
  }
}

export async function deleteColdMail(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    await ColdMail.findOneAndDelete({ _id: id, userId: session.user.id });
    revalidatePath("/cold-mails");
    revalidatePath("/dashboard");
    revalidatePath("/timeline");
    return { success: true };
  } catch {
    return { error: "Failed to delete cold mail" };
  }
}

export async function getTodaysColdMailCount(clientDate?: string, tzOffset?: number) {
  const session = await auth();
  if (!session?.user?.id) return { count: 0 };

  await connectDB();
  let start = getLocalDayBounds().start;
  let nextDay = getLocalDayBounds().nextDay;

  if (clientDate && typeof tzOffset === 'number') {
    const [y, m, d] = clientDate.split("-").map(Number);
    const utcMidnight = new Date(Date.UTC(y, m - 1, d));
    start = new Date(utcMidnight.getTime() + tzOffset * 60000);
    nextDay = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  }

  const count = await ColdMail.countDocuments({ userId: session.user.id, date: { $gte: start, $lt: nextDay } });
  return { count };
}
