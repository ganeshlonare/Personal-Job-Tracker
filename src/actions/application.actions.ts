"use server";

import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Application from "@/models/Application";
import { revalidatePath } from "next/cache";
import { getLocalDayBounds } from "@/lib/utils";

export async function getApplications(filters?: {
  status?: string;
  priority?: string;
  search?: string;
  archived?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) return [];

  await connectDB();

  const query: Record<string, unknown> = {
    userId: session.user.id,
    archived: filters?.archived || false,
  };

  if (filters?.status && filters.status !== "all") {
    query.status = filters.status;
  }
  if (filters?.priority && filters.priority !== "all") {
    query.priority = filters.priority;
  }
  if (filters?.search) {
    query.$or = [
      { company: { $regex: filters.search, $options: "i" } },
      { role: { $regex: filters.search, $options: "i" } },
    ];
  }

  const applications = await Application.find(query)
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(applications));
}

export async function getApplication(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectDB();

  const app = await Application.findOne({
    _id: id,
    userId: session.user.id,
  }).lean();

  if (!app) return null;
  return JSON.parse(JSON.stringify(app));
}

export async function createApplication(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();

    const app = await Application.create({
      ...data,
      userId: session.user.id,
      timeline: [{ status: (data.status as string) || "wishlist", date: new Date(), note: "Application created" }],
    });

    revalidatePath("/applications");
    revalidatePath("/dashboard");

    const { updateUserActivity } = await import("@/actions/auth.actions");
    await updateUserActivity(session.user.id);

    return { success: true, id: app._id.toString() };
  } catch (error) {
    console.error("Create application error:", error);
    return { error: "Failed to create application" };
  }
}

export async function updateApplication(id: string, data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();

    const existing = await Application.findOne({ _id: id, userId: session.user.id });
    if (!existing) return { error: "Not found" };

    // If status changed, add to timeline
    const updateData = { ...data };
    if (data.status && data.status !== existing.status) {
      await Application.findByIdAndUpdate(id, {
        $push: {
          timeline: {
            status: data.status,
            date: new Date(),
            note: data.statusNote || "",
          },
        },
      });
    }

    await Application.findByIdAndUpdate(id, { $set: updateData });

    revalidatePath("/applications");
    revalidatePath(`/applications/${id}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Update application error:", error);
    return { error: "Failed to update application" };
  }
}

export async function deleteApplication(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    await Application.findOneAndDelete({ _id: id, userId: session.user.id });

    revalidatePath("/applications");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Delete application error:", error);
    return { error: "Failed to delete" };
  }
}

export async function archiveApplication(id: string) {
  return updateApplication(id, { archived: true });
}

export async function getTodaysApplications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  await connectDB();

  const { start, nextDay } = getLocalDayBounds();

  const applications = await Application.find({
    userId: session.user.id,
    archived: false,
    $or: [
      { appliedDate: { $gte: start, $lt: nextDay } },
      {
        appliedDate: { $exists: false },
        createdAt: { $gte: start, $lt: nextDay },
        status: { $nin: ["wishlist", "planning"] },
      },
    ],
  })
    .sort({ appliedDate: -1, createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(applications));
}

export async function getTodaysApplicationCount() {
  const session = await auth();
  if (!session?.user?.id) return { count: 0 };

  await connectDB();
  const { start, nextDay } = getLocalDayBounds();

  const count = await Application.countDocuments({
    userId: session.user.id,
    archived: false,
    $or: [
      { appliedDate: { $gte: start, $lt: nextDay } },
      {
        appliedDate: { $exists: false },
        createdAt: { $gte: start, $lt: nextDay },
        status: { $nin: ["wishlist", "planning"] },
      },
    ],
  });
  return { count };
}
