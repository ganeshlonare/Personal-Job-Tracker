import { notFound } from "next/navigation";
import Link from "next/link";
import { getApplication } from "@/actions/application.actions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatDate } from "@/lib/utils";
import { ApplicationDetailClient } from "@/components/applications/ApplicationDetailClient";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const app = await getApplication(id);
  if (!app) return { title: "Application — JobOS" };
  return { title: `${app.role} at ${app.company} — JobOS` };
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  const application = await getApplication(id);

  if (!application) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/applications"
          className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-70"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Applications
        </Link>
        <span style={{ color: "var(--color-muted-foreground)" }}>/</span>
        <span className="text-sm" style={{ color: "var(--color-foreground)" }}>
          {application.company}
        </span>
      </div>

      <ApplicationDetailClient application={application} />
    </div>
  );
}
