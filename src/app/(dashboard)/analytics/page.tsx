import { AnalyticsClient } from "@/components/analytics/AnalyticsClient";

export const metadata = {
  title: "Analytics | JobOS",
  description: "Data-driven insights into your job hunt performance",
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <AnalyticsClient />
    </div>
  );
}
