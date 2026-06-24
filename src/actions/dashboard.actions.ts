"use server";

import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Application from "@/models/Application";
import Task from "@/models/Task";
import Leetcode from "@/models/Leetcode";
import StudySession from "@/models/StudySession";
import DailyScore from "@/models/DailyScore";
import Interview from "@/models/Interview";
import Goal from "@/models/Goal";
import Project from "@/models/Project";
import User from "@/models/User";
import mongoose from "mongoose";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, subDays, format } from "date-fns";

export async function getDashboardData() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  try {
    await connectDB();
  } catch (e) {
    console.error("Failed to connect to database in getDashboardData:", e);
    // If DB is not available, return null so the page can render an empty/fallback state
    return null;
  }

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const user = await User.findById(userId).select("name currentStreak dailyGoal lifetimeScore leetcodeUsername").lean();

  // Parallel data fetch
  const [
    totalApplications,
    weeklyApplications,
    todayTasks,
    allTasks,
    todayStudy,
    todayScore,
    upcomingInterviews,
    activeGoals,
    inProgressProjects,
    recentActivity,
    heatmapData,
  ] = await Promise.all([
    Application.countDocuments({ userId, archived: false }),
    Application.countDocuments({
      userId,
      appliedDate: { $gte: weekStart, $lte: weekEnd },
    }),
    Task.find({ userId, date: { $gte: todayStart, $lte: todayEnd } })
      .sort({ priority: -1 })
      .lean(),
    Task.find({ userId, date: { $gte: todayStart, $lte: todayEnd } }).lean(),
    StudySession.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: todayStart, $lte: todayEnd },
        },
      },
      { $group: { _id: null, totalMinutes: { $sum: "$duration" } } },
    ]),
    DailyScore.findOne({
      userId,
      date: { $gte: todayStart, $lte: todayEnd },
    }).lean(),
    Interview.find({
      userId,
      date: { $gte: now },
      result: "pending",
    })
      .sort({ date: 1 })
      .limit(5)
      .lean(),
    Goal.find({ userId, status: "active" }).limit(3).lean(),
    Project.find({ userId, status: "in_progress" }).limit(2).lean(),
    // Recent activity: last 10 applications
    Application.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("company role status createdAt")
      .lean(),
    // Heatmap: last 90 days score data
    DailyScore.find({
      userId,
      date: { $gte: subDays(now, 90) },
    })
      .sort({ date: 1 })
      .lean(),
  ]);

  let leetStats = { total: 0, easy: 0, medium: 0, hard: 0 };
  const typedUser = user as any;
  if (typedUser?.leetcodeUsername) {
    try {
      const res = await fetch(`https://alfa-leetcode-api.onrender.com/${typedUser.leetcodeUsername}/solved`, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        leetStats = {
          total: data.solvedProblem || 0,
          easy: data.easySolved || 0,
          medium: data.mediumSolved || 0,
          hard: data.hardSolved || 0,
        };
      }
    } catch (e) {
      console.error("Failed to fetch Leetcode API in dashboard", e);
    }
  }

  // Calculate stats
  const applications = await Application.find({ userId, archived: false })
    .select("status")
    .lean();

  const responded = applications.filter((a) =>
    ["offer", "accepted", "rejected", "interview_scheduled",
     "technical_round", "manager_round", "hr_round", "final_round"].includes(a.status)
  ).length;

  const rejected = applications.filter((a) => a.status === "rejected").length;
  const interviews = applications.filter((a) =>
    ["interview_scheduled", "technical_round", "manager_round", "hr_round", "final_round"].includes(a.status)
  ).length;

  const responseRate = totalApplications > 0
    ? Math.round((responded / totalApplications) * 100)
    : 0;
  const rejectionRate = totalApplications > 0
    ? Math.round((rejected / totalApplications) * 100)
    : 0;
  const interviewConversion = totalApplications > 0
    ? Math.round((interviews / totalApplications) * 100)
    : 0;

  const studyMinutes = todayStudy[0]?.totalMinutes || 0;
  const currentScore = todayScore?.score || 0;

  const tasksCompleted = allTasks.filter((t) => t.completed).length;
  const tasksTotal = allTasks.length;

  // Dynamically calculate streak from all DailyScores
  const allScores = await DailyScore.find({ userId, score: { $gt: 0 } }).select("date").lean();
  const activeDates = allScores.map(s => s.date);
  
  const { calculateStreak } = await import("@/lib/scoring");
  let realStreak = calculateStreak(activeDates);

  // Auto-update streak if they have any score today but streak logic hasn't run
  // We can also update the User document with the real calculated streak
  if (realStreak !== (user as any).currentStreak) {
    await User.findByIdAndUpdate(userId, { 
      currentStreak: realStreak,
      ...(realStreak > ((user as any).longestStreak || 0) ? { longestStreak: realStreak } : {})
    });
  }

  // Build heatmap
  const heatmap = heatmapData.map((d) => ({
    date: format(new Date(d.date), "yyyy-MM-dd"),
    count: d.score,
    level: d.score === 0 ? 0 : d.score < 30 ? 1 : d.score < 60 ? 2 : d.score < 100 ? 3 : 4,
  }));

  return {
    user: JSON.parse(JSON.stringify(user)),
    stats: {
      currentStreak: realStreak,
      todayScore: currentScore,
      dailyTarget: (user as { dailyGoal?: number })?.dailyGoal || 100,
      weeklyApplications,
      totalApplications,
      responseRate,
      rejectionRate,
      interviewConversion,
      leetcodeSolved: leetStats.total,
      leetcodeBreakdown: { easy: leetStats.easy, medium: leetStats.medium, hard: leetStats.hard },
      studyMinutesToday: studyMinutes,
      tasksCompleted,
      tasksTotal,
    },
    todayTasks: JSON.parse(JSON.stringify(todayTasks)),
    upcomingInterviews: JSON.parse(JSON.stringify(upcomingInterviews)),
    activeGoals: JSON.parse(JSON.stringify(activeGoals)),
    inProgressProjects: JSON.parse(JSON.stringify(inProgressProjects)),
    recentActivity: JSON.parse(JSON.stringify(recentActivity)),
    heatmap,
  };
}
