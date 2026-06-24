"use server";

import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Company from "@/models/Company";
import { revalidatePath } from "next/cache";

export async function getCompanies(filters?: { favorite?: boolean; search?: string }) {
  const session = await auth();
  if (!session?.user?.id) return [];

  await connectDB();

  const query: Record<string, unknown> = { userId: session.user.id };
  if (filters?.favorite) query.favorite = true;
  if (filters?.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { industry: { $regex: filters.search, $options: "i" } },
    ];
  }

  const companies = await Company.find(query).sort({ updatedAt: -1 }).lean();
  return JSON.parse(JSON.stringify(companies));
}

export async function createCompany(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    const company = await Company.create({ ...data, userId: session.user.id });

    revalidatePath("/companies");
    return { success: true, id: company._id.toString() };
  } catch (error) {
    console.error("Create company error:", error);
    return { error: "Failed to create company" };
  }
}

export async function updateCompany(id: string, data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    await Company.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: data }
    );

    revalidatePath("/companies");
    return { success: true };
  } catch {
    return { error: "Failed to update" };
  }
}

export async function toggleFavorite(id: string, favorite: boolean) {
  return updateCompany(id, { favorite });
}

export async function deleteCompany(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    await Company.findOneAndDelete({ _id: id, userId: session.user.id });

    revalidatePath("/companies");
    return { success: true };
  } catch {
    return { error: "Failed to delete" };
  }
}
