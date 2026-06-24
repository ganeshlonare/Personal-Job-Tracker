"use server";

import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Interview from "@/models/Interview";
import { revalidatePath } from "next/cache";

export async function getInterviews() {
  const session = await auth();
  if (!session?.user?.id) return [];

  await connectDB();
  const interviews = await Interview.find({ userId: session.user.id })
    .sort({ date: -1 })
    .lean();
  return JSON.parse(JSON.stringify(interviews));
}

export async function getInterview(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectDB();
  const interview = await Interview.findOne({ _id: id, userId: session.user.id }).lean();
  if (!interview) return null;
  return JSON.parse(JSON.stringify(interview));
}

export async function createInterview(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    const interview = await Interview.create({ ...data, userId: session.user.id });

    revalidatePath("/interviews");
    revalidatePath("/dashboard");
    return { success: true, id: interview._id.toString() };
  } catch (error) {
    console.error("Create interview error:", error);
    return { error: "Failed to create interview" };
  }
}

export async function updateInterview(id: string, data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    await Interview.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: data }
    );

    revalidatePath("/interviews");
    return { success: true };
  } catch {
    return { error: "Failed to update" };
  }
}

export async function deleteInterview(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    await Interview.findOneAndDelete({ _id: id, userId: session.user.id });

    revalidatePath("/interviews");
    return { success: true };
  } catch {
    return { error: "Failed to delete" };
  }
}
