"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Flame, Zap, Target, Send, BarChart3, Code2,
  BookOpen, TrendingUp, TrendingDown, Clock,
  Calendar, Trophy, ArrowRight, CheckCircle2,
  Circle, FolderKanban, MessageSquarePlus,
} from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getGreeting, formatDate, calculatePercentage } from "@/lib/utils";
import { MOTIVATIONAL_QUOTES } from "@/lib/constants";
import { ContributionHeatmap } from "./ContributionHeatmap";
import { QuickActions } from "./QuickActions";
import { formatRelativeDate } from "@/lib/utils";

interface DashboardData {
  stats: {
    currentStreak: number;
    todayScore: number;
    dailyTarget: number;
    weeklyApplications: number;
    totalApplications: number;
    responseRate: number;
    rejectionRate: number;
    interviewConversion: number;
    leetcodeSolved: number;
    leetcodeBreakdown: { easy: number; medium: number; hard: number };
    studyMinutesToday: number;
    tasksCompleted: number;
    tasksTotal: number;
  };
  todayTasks: Array<{
    _id: string;
    title: string;
    category: string;
    priority: string;
    completed: boolean;
    points: number;
  }>;
  upcomingInterviews: Array<{
    _id: string;
    company: string;
    role: string;
    date: string;
    round: string;
  }>;
  activeGoals: Array<{
    _id: string;
    title: string;
    currentValue: number;
    targetValue: number;
    unit: string;
  }>;
  inProgressProjects: Array<{
    _id: string;
    title: string;
    progress: number;
    techStack: string[];
  }>;
  recentActivity: Array<{
    _id: string;
    company: string;
    role: string;
    status: string;
    createdAt: string;
  }>;
  heatmap: Array<{ date: string; count: number; level: number }>;
}

interface DashboardContentProps {
  userName: string;
  data: DashboardData | null;
}

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export function DashboardContent({ userName, data }: DashboardContentProps) {
  const greeting = getGreeting();
  const stats = data?.stats;
  const todayProgress = stats
    ? calculatePercentage(stats.todayScore, stats.dailyTarget)
    : 0;

  // Random daily quote
  const quote =
    MOTIVATIONAL_QUOTES[new Date().getDate() % MOTIVATIONAL_QUOTES.length];

  const cardStyle = {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background:
            "linear-gradient(135deg, #1e1b4b 0%, #2d1b69 40%, #1a1040 100%)",
          border: "1px solid rgba(99,102,241,0.2)",
        }}
      >
        {/* Background decoration */}
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #818CF8, transparent)" }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #C084FC, transparent)" }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-indigo-300 text-sm font-medium mb-1">
              {greeting},{" "}
            </p>
            <h2 className="text-white text-2xl md:text-3xl font-bold mb-2">
              {userName} 👋
            </h2>
            <p className="text-indigo-200 text-sm max-w-md italic">
              &ldquo;{quote.text}&rdquo;
              <span className="text-indigo-400 not-italic"> — {quote.author}</span>
            </p>
          </div>

          {/* Today's Progress Ring */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="url(#progressGrad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - todayProgress / 100)}`}
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                  />
                  <defs>
                    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#818CF8" />
                      <stop offset="100%" stopColor="#C084FC" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white text-lg font-bold leading-none">
                    {todayProgress}%
                  </span>
                </div>
              </div>
              <p className="text-indigo-300 text-xs mt-1">Daily Goal</p>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-white font-bold text-xl">
                  {stats?.currentStreak || 0}
                </span>
              </div>
              <p className="text-indigo-300 text-xs">day streak</p>

              <div className="flex items-center gap-2 justify-end mt-3 mb-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-bold text-xl">
                  {stats?.todayScore || 0}
                </span>
              </div>
              <p className="text-indigo-300 text-xs">pts today</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4"
      >
        <StatCard
          title="Total Apps"
          value={stats?.totalApplications || 0}
          subtitle="All time"
          icon={<Send className="w-5 h-5" />}
          iconBg="bg-blue-500/10"
          color="#3B82F6"
        />
        <StatCard
          title="This Week"
          value={stats?.weeklyApplications || 0}
          subtitle="Applications"
          icon={<TrendingUp className="w-5 h-5" />}
          iconBg="bg-green-500/10"
          color="#22C55E"
        />
        <StatCard
          title="Response Rate"
          value={`${stats?.responseRate || 0}%`}
          subtitle="Replied"
          icon={<BarChart3 className="w-5 h-5" />}
          iconBg="bg-indigo-500/10"
          color="#6366F1"
        />
        <StatCard
          title="Rejection Rate"
          value={`${stats?.rejectionRate || 0}%`}
          subtitle="Declined"
          icon={<TrendingDown className="w-5 h-5" />}
          iconBg="bg-red-500/10"
          color="#EF4444"
        />
        <StatCard
          title="LeetCode"
          value={stats?.leetcodeSolved || 0}
          subtitle="Problems"
          icon={<Code2 className="w-5 h-5" />}
          iconBg="bg-yellow-500/10"
          color="#F59E0B"
        />
        <StatCard
          title="Study Today"
          value={
            (stats?.studyMinutesToday || 0) < 60
              ? `${stats?.studyMinutesToday || 0}m`
              : `${Math.floor((stats?.studyMinutesToday || 0) / 60)}h ${(stats?.studyMinutesToday || 0) % 60}m`
          }
          subtitle={(stats?.studyMinutesToday || 0) < 60 ? "Minutes" : "Hours"}
          icon={<BookOpen className="w-5 h-5" />}
          iconBg="bg-purple-500/10"
          color="#8B5CF6"
        />
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contribution Heatmap */}
          <motion.div variants={itemVariants} className="rounded-2xl p-5" style={cardStyle}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: "var(--color-foreground)" }}>
                Activity Heatmap
              </h3>
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{ background: "var(--color-secondary)", color: "var(--color-muted-foreground)" }}
              >
                Last 90 days
              </span>
            </div>
            <ContributionHeatmap data={data?.heatmap || []} />
          </motion.div>



          {/* Today's Tasks */}
          <motion.div variants={itemVariants} className="rounded-2xl p-5" style={cardStyle}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold" style={{ color: "var(--color-foreground)" }}>
                  Today&apos;s Mission
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
                  {stats?.tasksCompleted || 0}/{stats?.tasksTotal || 0} tasks completed
                </p>
              </div>
              <Link
                href="/today"
                className="text-xs font-medium flex items-center gap-1 hover:opacity-70 transition-opacity"
                style={{ color: "var(--color-primary)" }}
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Progress bar */}
            {(stats?.tasksTotal || 0) > 0 && (
              <div className="mb-4">
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "var(--color-secondary)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${calculatePercentage(stats?.tasksCompleted || 0, stats?.tasksTotal || 1)}%`,
                      background: "linear-gradient(90deg, #6366F1, #8B5CF6)",
                    }}
                  />
                </div>
              </div>
            )}

            {data?.todayTasks && data.todayTasks.length > 0 ? (
              <div className="space-y-2">
                {data.todayTasks.slice(0, 6).map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-colors hover:bg-[var(--color-secondary)]"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 flex-shrink-0 text-[var(--color-muted-foreground)]" />
                    )}
                    <span
                      className={`flex-1 text-sm ${task.completed ? "line-through opacity-50" : ""}`}
                      style={{ color: "var(--color-foreground)" }}
                    >
                      {task.title}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                      style={{
                        background: "var(--color-secondary)",
                        color: "var(--color-muted-foreground)",
                      }}
                    >
                      +{task.points}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Target className="w-6 h-6 text-indigo-400" />}
                title="No tasks yet"
                description="Add your first task for today"
                action={
                  <Link
                    href="/today"
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                    style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
                  >
                    Plan Your Day
                  </Link>
                }
              />
            )}
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants} className="rounded-2xl p-5" style={cardStyle}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: "var(--color-foreground)" }}>
                Recent Activity
              </h3>
              <Link
                href="/applications"
                className="text-xs font-medium flex items-center gap-1 hover:opacity-70 transition-opacity"
                style={{ color: "var(--color-primary)" }}
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {data?.recentActivity && data.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {data.recentActivity.slice(0, 6).map((item, i) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{
                        background: `hsl(${(i * 47) % 360}, 70%, 50%)`,
                      }}
                    >
                      {item.company.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--color-foreground)" }}>
                        {item.role}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--color-muted-foreground)" }}>
                        {item.company}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={item.status} size="sm" />
                      <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                        {formatRelativeDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Send className="w-6 h-6 text-blue-400" />}
                title="No applications yet"
                description="Start tracking your job applications"
                action={
                  <Link
                    href="/applications/new"
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                    style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
                  >
                    Add Application
                  </Link>
                }
              />
            )}
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <QuickActions />
          </motion.div>

          {/* Upcoming Interviews */}
          <motion.div variants={itemVariants} className="rounded-2xl p-5" style={cardStyle}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: "var(--color-foreground)" }}>
                Upcoming Interviews
              </h3>
              <Link
                href="/interviews"
                className="text-xs font-medium hover:opacity-70"
                style={{ color: "var(--color-primary)" }}
              >
                View all
              </Link>
            </div>

            {data?.upcomingInterviews && data.upcomingInterviews.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingInterviews.slice(0, 4).map((interview) => (
                  <div
                    key={interview._id}
                    className="p-3 rounded-xl"
                    style={{ background: "var(--color-secondary)" }}
                  >
                    <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                      {interview.company}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
                      {interview.round}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Calendar className="w-3 h-3" style={{ color: "var(--color-primary)" }} />
                      <span className="text-xs font-medium" style={{ color: "var(--color-primary)" }}>
                        {formatDate(interview.date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Calendar className="w-6 h-6 text-pink-400" />}
                title="No upcoming interviews"
                description="Interviews will appear here"
                action={
                  <Link
                    href="/interviews"
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                    style={{ background: "linear-gradient(135deg, #EC4899, #DB2777)" }}
                  >
                    View Interviews
                  </Link>
                }
              />
            )}
          </motion.div>

          {/* Active Goals */}
          <motion.div variants={itemVariants} className="rounded-2xl p-5" style={cardStyle}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: "var(--color-foreground)" }}>
                Active Goals
              </h3>
              <Link
                href="/goals"
                className="text-xs font-medium hover:opacity-70"
                style={{ color: "var(--color-primary)" }}
              >
                View all
              </Link>
            </div>

            {data?.activeGoals && data.activeGoals.length > 0 ? (
              <div className="space-y-4">
                {data.activeGoals.map((goal) => {
                  const pct = calculatePercentage(goal.currentValue, goal.targetValue);
                  return (
                    <div key={goal._id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium truncate flex-1" style={{ color: "var(--color-foreground)" }}>
                          {goal.title}
                        </p>
                        <span className="text-xs font-semibold ml-2" style={{ color: "var(--color-primary)" }}>
                          {pct}%
                        </span>
                      </div>
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: "var(--color-secondary)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: "linear-gradient(90deg, #6366F1, #8B5CF6)",
                            transition: "width 0.7s ease",
                          }}
                        />
                      </div>
                      <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={<Trophy className="w-6 h-6 text-yellow-400" />}
                title="No active goals"
                description="Create goals to track your progress"
                action={
                  <Link
                    href="/goals"
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                    style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
                  >
                    Add Goal
                  </Link>
                }
              />
            )}
          </motion.div>

          {/* Projects */}
          <motion.div variants={itemVariants} className="rounded-2xl p-5" style={cardStyle}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: "var(--color-foreground)" }}>
                Projects In Progress
              </h3>
              <Link
                href="/projects"
                className="text-xs font-medium hover:opacity-70"
                style={{ color: "var(--color-primary)" }}
              >
                View all
              </Link>
            </div>

            {data?.inProgressProjects && data.inProgressProjects.length > 0 ? (
              <div className="space-y-3">
                {data.inProgressProjects.map((project) => (
                  <div
                    key={project._id}
                    className="p-3 rounded-xl"
                    style={{ background: "var(--color-secondary)" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                        {project.title}
                      </p>
                      <span className="text-xs font-bold" style={{ color: "var(--color-primary)" }}>
                        {project.progress}%
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: "var(--color-border)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${project.progress}%`,
                          background: "linear-gradient(90deg, #10B981, #059669)",
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.techStack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{
                            background: "var(--color-card)",
                            color: "var(--color-muted-foreground)",
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FolderKanban className="w-6 h-6 text-green-400" />}
                title="No active projects"
                description="Track your side projects here"
                action={
                  <Link
                    href="/projects"
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                    style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
                  >
                    Add Project
                  </Link>
                }
              />
            )}
          </motion.div>
        </div>
      </div>

      {/* LeetCode breakdown */}
      <motion.div variants={itemVariants} className="rounded-2xl p-5" style={cardStyle}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: "var(--color-foreground)" }}>
            LeetCode Progress
          </h3>
          <Link
            href="/leetcode"
            className="text-xs font-medium flex items-center gap-1 hover:opacity-70"
            style={{ color: "var(--color-primary)" }}
          >
            Practice <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Easy", count: stats?.leetcodeBreakdown?.easy || 0, color: "#22C55E" },
            { label: "Medium", count: stats?.leetcodeBreakdown?.medium || 0, color: "#F59E0B" },
            { label: "Hard", count: stats?.leetcodeBreakdown?.hard || 0, color: "#EF4444" },
          ].map(({ label, count, color }) => (
            <div
              key={label}
              className="text-center p-4 rounded-xl"
              style={{ background: "var(--color-secondary)" }}
            >
              <p
                className="text-3xl font-bold mb-1"
                style={{ color }}
              >
                {count}
              </p>
              <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
