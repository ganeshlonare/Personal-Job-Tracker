"use server";

import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import CalendarEvent from "@/models/CalendarEvent";
import { revalidatePath } from "next/cache";

export async function getCalendarEvents() {
  const session = await auth();
  if (!session?.user?.id) return [];

  await connectDB();
  const events = await CalendarEvent.find({ userId: session.user.id })
    .sort({ date: 1, time: 1 })
    .lean();
    
  return JSON.parse(JSON.stringify(events));
}

export async function getUpcomingCalendarEvents() {
  const session = await auth();
  if (!session?.user?.id) return [];

  await connectDB();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const events = await CalendarEvent.find({ 
    userId: session.user.id,
    date: { $gte: today }
  })
    .sort({ date: 1, time: 1 })
    .limit(5)
    .lean();
    
  return JSON.parse(JSON.stringify(events));
}

export async function createCalendarEvent(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    const event = await CalendarEvent.create({ ...data, userId: session.user.id });
    revalidatePath("/calendar");
    return { success: true, id: event._id.toString() };
  } catch (error) {
    return { error: "Failed to create event" };
  }
}
