"use server";

import connectDB from "@/lib/db";
import User from "@/models/User";
import Task from "@/models/Task";
import Application from "@/models/Application";
import StudySession from "@/models/StudySession";
import ColdMail from "@/models/ColdMail";

export async function getTimelineData(userId: string) {
  await connectDB();

  const [user, tasks, applications, studySessions, coldMails] = await Promise.all([
    User.findById(userId).select("createdAt leetcodeUsername").lean(),
    Task.find({ userId }).select("title category completedAt date description completed points").lean(),
    Application.find({ userId }).select("company role appliedDate createdAt").lean(),
    StudySession.find({ userId }).select("topic duration date").lean(),
    ColdMail.find({ userId }).select("recipientName company date status").lean(),
  ]);

  const typedUser = user as any;

  let leetcodeSubmissions = [];
  if (typedUser?.leetcodeUsername) {
    try {
      const res = await fetch(`https://alfa-leetcode-api.onrender.com/${typedUser.leetcodeUsername}/acSubmission`, {
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.submission) {
          leetcodeSubmissions = data.submission;
        }
      }
    } catch (e) {
      console.error("Failed to fetch Leetcode API for timeline", e);
    }
  }

  return {
    userCreatedAt: typedUser?.createdAt ? typedUser.createdAt.toISOString() : new Date().toISOString(),
    tasks: JSON.parse(JSON.stringify(tasks)),
    applications: JSON.parse(JSON.stringify(applications)),
    studySessions: JSON.parse(JSON.stringify(studySessions)),
    coldMails: JSON.parse(JSON.stringify(coldMails)),
    leetcodeSubmissions,
  };
}
