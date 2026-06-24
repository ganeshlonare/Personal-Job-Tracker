"use server";

import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { signIn, signOut } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    await connectDB();

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return { error: "User already exists with this email" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      preferredTechStack: [],
      dailyGoal: 100,
      currentStreak: 0,
      longestStreak: 0,
      lifetimeScore: 0,
      onboarding: false,
    });

    return { success: true, userId: user._id.toString() };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function loginUser(data: { email: string; password: string }) {
  try {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    return { success: true, result };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Invalid email or password" };
  }
}

export async function logoutUser() {
  await signOut({ redirect: false });
}

export async function getCurrentUser(userId: string) {
  try {
    await connectDB();
    const user = await User.findById(userId).select("-password").lean();
    if (!user) return null;
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}

export async function updateUser(
  userId: string,
  data: Record<string, unknown>
) {
  try {
    await connectDB();
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true }
    )
      .select("-password")
      .lean();

    if (!user) return { error: "User not found" };
    
    revalidatePath("/leetcode");
    revalidatePath("/github");
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    
    return { success: true, user: JSON.parse(JSON.stringify(user)) };
  } catch (error) {
    console.error("Update user error:", error);
    return { error: "Failed to update profile" };
  }
}

export async function updateUserActivity(userId: string) {
  try {
    const { startOfDay, differenceInDays } = await import("date-fns");
    await connectDB();
    const user = await User.findById(userId);
    if (!user) return;

    const today = startOfDay(new Date());
    const lastActive = user.lastActiveDate ? startOfDay(new Date(user.lastActiveDate)) : null;

    if (!lastActive) {
      user.currentStreak = 1;
      if (user.currentStreak > user.longestStreak) {
        user.longestStreak = user.currentStreak;
      }
      user.lastActiveDate = new Date();
      await user.save();
    } else {
      const diff = differenceInDays(today, lastActive);
      if (diff === 1) {
        user.currentStreak += 1;
        if (user.currentStreak > user.longestStreak) {
          user.longestStreak = user.currentStreak;
        }
        user.lastActiveDate = new Date();
        await user.save();
      } else if (diff > 1) {
        user.currentStreak = 1;
        user.lastActiveDate = new Date();
        await user.save();
      } else if (diff === 0 && user.currentStreak === 0) {
        // Fix for legacy data where streak is 0 but lastActive is today
        user.currentStreak = 1;
        if (user.currentStreak > user.longestStreak) {
          user.longestStreak = user.currentStreak;
        }
        await user.save();
      }
    }
    
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Update activity error:", error);
  }
}
