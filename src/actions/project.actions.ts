"use server";

import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import { revalidatePath } from "next/cache";

export async function getProjects(status?: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  await connectDB();

  const query: Record<string, unknown> = { userId: session.user.id };
  if (status && status !== "all") query.status = status;

  const projects = await Project.find(query).sort({ updatedAt: -1 }).lean();
  return JSON.parse(JSON.stringify(projects));
}

export async function getProject(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectDB();
  const project = await Project.findOne({ _id: id, userId: session.user.id }).lean();
  if (!project) return null;
  return JSON.parse(JSON.stringify(project));
}

export async function createProject(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    const project = await Project.create({
      ...data,
      userId: session.user.id,
      progress: 0,
      status: "planning",
    });

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { success: true, id: project._id.toString() };
  } catch (error) {
    console.error("Create project error:", error);
    return { error: "Failed to create project" };
  }
}

export async function updateProject(id: string, data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    await Project.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: data }
    );

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to update project" };
  }
}

export async function addDailyLog(id: string, hours: number, notes?: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    await Project.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $push: { dailyLogs: { date: new Date(), hours, notes } } }
    );

    revalidatePath("/projects");
    return { success: true };
  } catch {
    return { error: "Failed to add log" };
  }
}

export async function deleteProject(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    await Project.findOneAndDelete({ _id: id, userId: session.user.id });

    revalidatePath("/projects");
    return { success: true };
  } catch {
    return { error: "Failed to delete" };
  }
}
