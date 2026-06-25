"use server";

import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Goal from "@/models/Goal";
import { revalidatePath } from "next/cache";

export async function getGoals(status?: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  await connectDB();

  const query: Record<string, unknown> = { userId: session.user.id };
  if (status && status !== "all") query.status = status;

  const goals = await Goal.find(query).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(goals));
}

export async function createGoal(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    const goal = await Goal.create({ ...data, userId: session.user.id, currentValue: 0 });

    revalidatePath("/goals");
    revalidatePath("/dashboard");
    return { success: true, id: goal._id.toString() };
  } catch (error) {
    console.error("Create goal error:", error);
    return { error: "Failed to create goal" };
  }
}

export async function updateGoal(id: string, data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    await Goal.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: data }
    );

    revalidatePath("/goals");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to update goal" };
  }
}

export async function incrementGoal(id: string, amount: number = 1) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $inc: { currentValue: amount } },
      { new: true }
    );

    if (goal && goal.currentValue >= goal.targetValue) {
      await Goal.findByIdAndUpdate(id, { status: "completed" });
    }

    // Check milestones
    if (goal && goal.milestones && goal.milestones.length > 0) {
      const updatedMilestones = goal.milestones.map((m: any) => {
        if (!m.reached && goal.currentValue >= m.value) {
          return { ...m, reached: true, reachedAt: new Date() };
        }
        return m;
      });
      await Goal.findByIdAndUpdate(id, { milestones: updatedMilestones });
    }

    revalidatePath("/goals");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to update goal" };
  }
}

export async function addMilestone(goalId: string, title: string, value: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    await Goal.findByIdAndUpdate(
      { _id: goalId, userId: session.user.id },
      { $push: { milestones: { title, value, reached: false } } }
    );

    revalidatePath("/goals");
    return { success: true };
  } catch {
    return { error: "Failed to add milestone" };
  }
}

export async function toggleGoalStatus(id: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    await Goal.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: { status } }
    );

    revalidatePath("/goals");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to update status" };
  }
}

export async function deleteGoal(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    await Goal.findOneAndDelete({ _id: id, userId: session.user.id });

    revalidatePath("/goals");
    return { success: true };
  } catch {
    return { error: "Failed to delete goal" };
  }
}
