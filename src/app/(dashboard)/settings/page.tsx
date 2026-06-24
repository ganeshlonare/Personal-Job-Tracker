import { PageHeader } from "@/components/shared/PageHeader";
import { SettingsClient } from "@/components/settings/SettingsClient";

export const metadata = {
  title: "Settings | JobOS",
  description: "Manage your account preferences and configurations",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <SettingsClient />
    </div>
  );
}
