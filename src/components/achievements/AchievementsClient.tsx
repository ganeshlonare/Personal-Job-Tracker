"use client";

import { motion } from "framer-motion";
import { Trophy, Star, Target, Code2, Zap, Medal, Send, Flame, Crown, GraduationCap } from "lucide-react";
import { calculatePercentage } from "@/lib/utils";

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

export function AchievementsClient() {
  const achievements = [
    { id: 1, title: "First Step", desc: "Submit your first job application", icon: <Send className="w-6 h-6" />, category: "applications", target: 1, progress: 1, unlocked: true, color: "#3B82F6" },
    { id: 2, title: "Consistent Applicant", desc: "Submit 50 job applications", icon: <Target className="w-6 h-6" />, category: "applications", target: 50, progress: 24, unlocked: false, color: "#6366F1" },
    { id: 3, title: "Interview Ready", desc: "Get your first interview invite", icon: <Star className="w-6 h-6" />, category: "interviews", target: 1, progress: 0, unlocked: false, color: "#F59E0B" },
    { id: 4, title: "Algorithm Ace", desc: "Solve 100 LeetCode problems", icon: <Code2 className="w-6 h-6" />, category: "leetcode", target: 100, progress: 42, unlocked: false, color: "#22C55E" },
    { id: 5, title: "On Fire", desc: "Reach a 7-day streak", icon: <Flame className="w-6 h-6" />, category: "streak", target: 7, progress: 7, unlocked: true, color: "#EF4444" },
    { id: 6, title: "Unstoppable", desc: "Reach a 30-day streak", icon: <Zap className="w-6 h-6" />, category: "streak", target: 30, progress: 12, unlocked: false, color: "#EC4899" },
    { id: 7, title: "Scholar", desc: "Log 100 hours of study time", icon: <GraduationCap className="w-6 h-6" />, category: "study", target: 100, progress: 65, unlocked: false, color: "#8B5CF6" },
    { id: 8, title: "Project Master", desc: "Complete 3 side projects", icon: <Medal className="w-6 h-6" />, category: "projects", target: 3, progress: 1, unlocked: false, color: "#10B981" },
    { id: 9, title: "Job Secured", desc: "Accept a job offer", icon: <Crown className="w-6 h-6" />, category: "general", target: 1, progress: 0, unlocked: false, color: "#F59E0B" },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const totalProgress = calculatePercentage(unlockedCount, totalCount);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>
            Achievements
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>
            Track your milestones and gamify your job hunt
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[var(--color-card)] p-4 rounded-2xl border border-[var(--color-border)]">
          <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: "var(--color-foreground)" }}>
              {unlockedCount} <span className="text-sm font-normal text-[var(--color-muted-foreground)]">/ {totalCount}</span>
            </p>
            <div className="w-32 h-1.5 rounded-full mt-1" style={{ background: "var(--color-secondary)" }}>
              <div 
                className="h-full rounded-full transition-all duration-1000" 
                style={{ width: `${totalProgress}%`, background: "linear-gradient(90deg, #F59E0B, #FBBF24)" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => {
          const pct = calculatePercentage(achievement.progress, achievement.target);
          return (
            <motion.div
              key={achievement.id}
              variants={itemVariants}
              className={`p-6 rounded-2xl border transition-all ${
                achievement.unlocked 
                  ? "bg-[var(--color-card)] border-[var(--color-border)] shadow-sm" 
                  : "bg-[var(--color-secondary)]/50 border-transparent opacity-70 grayscale-[30%]"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div 
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                    achievement.unlocked ? "" : "opacity-50"
                  }`}
                  style={{ 
                    background: achievement.unlocked ? `${achievement.color}15` : "var(--color-secondary)",
                    color: achievement.unlocked ? achievement.color : "var(--color-muted-foreground)"
                  }}
                >
                  {achievement.icon}
                </div>
                {achievement.unlocked && (
                  <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: "var(--color-secondary)", color: "var(--color-foreground)" }}>
                    Unlocked
                  </span>
                )}
              </div>
              
              <h3 className="font-semibold text-lg mb-1" style={{ color: "var(--color-foreground)" }}>
                {achievement.title}
              </h3>
              <p className="text-sm mb-6" style={{ color: "var(--color-muted-foreground)" }}>
                {achievement.desc}
              </p>

              <div className="mt-auto">
                <div className="flex items-center justify-between text-xs font-medium mb-2" style={{ color: "var(--color-muted-foreground)" }}>
                  <span>{achievement.progress} / {achievement.target}</span>
                  <span style={{ color: achievement.unlocked ? achievement.color : "inherit" }}>{pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-secondary)" }}>
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${pct}%`,
                      background: achievement.unlocked ? achievement.color : "var(--color-muted-foreground)",
                      opacity: achievement.unlocked ? 1 : 0.5
                    }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
