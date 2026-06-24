import { AchievementsClient } from "@/components/achievements/AchievementsClient";

export const metadata = {
  title: "Achievements | JobOS",
  description: "Track your milestones and gamify your job hunt",
};

export default function AchievementsPage() {
  return (
    <div className="space-y-6">
      <AchievementsClient />
    </div>
  );
}
