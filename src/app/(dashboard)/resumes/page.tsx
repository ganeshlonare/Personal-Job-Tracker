import { ResumesClient } from "@/components/resumes/ResumesClient";

export const metadata = {
  title: "Resumes | JobOS",
  description: "Manage multiple resume versions tailored for different roles",
};

export default function ResumesPage() {
  return (
    <div className="space-y-6">
      <ResumesClient />
    </div>
  );
}
