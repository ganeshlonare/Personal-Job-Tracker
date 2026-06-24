export type DailyTargetCategory = "application" | "cold-mail" | "todo";

export const DAILY_TARGET_CATEGORIES: DailyTargetCategory[] = ["application", "cold-mail", "todo"];

export const DAILY_TARGET_META: Record<
  DailyTargetCategory,
  {
    label: string;
    shortLabel: string;
    color: string;
    gradient: string;
    taskPoints: number;
    buildTitle: (count: number) => string;
  }
> = {
  application: {
    label: "Job Applications",
    shortLabel: "Applications",
    color: "#6366F1",
    gradient: "linear-gradient(135deg, #6366F1, #8B5CF6)",
    taskPoints: 10,
    buildTitle: (count) =>
      `Send ${count} job application${count === 1 ? "" : "s"}`,
  },
  "cold-mail": {
    label: "Cold Mails",
    shortLabel: "Cold Mails",
    color: "#06B6D4",
    gradient: "linear-gradient(135deg, #06B6D4, #3B82F6)",
    taskPoints: 8,
    buildTitle: (count) =>
      `Send ${count} cold mail${count === 1 ? "" : "s"}`,
  },
  todo: {
    label: "Custom Todos",
    shortLabel: "Todos",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #10B981, #34D399)",
    taskPoints: 5,
    buildTitle: (count) => `Complete ${count} todo${count === 1 ? "" : "s"}`,
  },
};

export function buildTargetItem(category: DailyTargetCategory, count: number) {
  const meta = DAILY_TARGET_META[category];
  return {
    title: meta.buildTitle(count),
    category,
    points: count,
  };
}
