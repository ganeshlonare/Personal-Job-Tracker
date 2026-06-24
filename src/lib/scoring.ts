import { SCORE_POINTS } from "./constants";

export interface ScoreBreakdown {
  applications: number;
  leetcode: number;
  study: number;
  project: number;
  interview: number;
  networking: number;
  other: number;
}

export function calculateApplicationScore(count: number): number {
  return count * SCORE_POINTS.application;
}

export function calculateLeetcodeScore(
  difficulty: "easy" | "medium" | "hard"
): number {
  switch (difficulty) {
    case "easy":
      return SCORE_POINTS.leetcode_easy;
    case "medium":
      return SCORE_POINTS.leetcode_medium;
    case "hard":
      return SCORE_POINTS.leetcode_hard;
    default:
      return 0;
  }
}

export function calculateStudyScore(hours: number): number {
  return Math.floor(hours * SCORE_POINTS.study_hour);
}

export function calculateProjectScore(hours: number): number {
  return Math.floor(hours * SCORE_POINTS.project_hour);
}

export function calculateDailyScore(breakdown: ScoreBreakdown): number {
  return Object.values(breakdown).reduce((sum, val) => sum + val, 0);
}

export function getScoreLevel(score: number): {
  level: string;
  color: string;
  emoji: string;
} {
  if (score >= 150) return { level: "Legendary", color: "#F59E0B", emoji: "🏆" };
  if (score >= 100) return { level: "Outstanding", color: "#22C55E", emoji: "⭐" };
  if (score >= 75) return { level: "Great", color: "#3B82F6", emoji: "🔥" };
  if (score >= 50) return { level: "Good", color: "#8B5CF6", emoji: "💪" };
  if (score >= 25) return { level: "Getting Started", color: "#6B7280", emoji: "🌱" };
  return { level: "Begin Your Day", color: "#9CA3AF", emoji: "☀️" };
}

export function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const sortedDates = [...dates]
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDate = new Date(sortedDates[0]);
  firstDate.setHours(0, 0, 0, 0);

  // Check if the most recent activity is today or yesterday
  const diffFromToday = Math.floor(
    (today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffFromToday > 1) return 0;

  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i]);
    const previous = new Date(sortedDates[i - 1]);
    current.setHours(0, 0, 0, 0);
    previous.setHours(0, 0, 0, 0);

    const diff = Math.floor(
      (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff === 1) {
      streak++;
    } else if (diff > 1) {
      break;
    }
  }

  return streak;
}
