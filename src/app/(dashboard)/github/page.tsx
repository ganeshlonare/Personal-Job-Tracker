import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { GithubClient } from "@/components/github/GithubClient";
import { Loader2 } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "GitHub | JobOS",
  description: "Your GitHub activity heatmap and daily commits",
};

export default async function GithubPage() {
  const session = await auth();
  
  let githubUsername = "";
  if (session?.user?.id) {
    const { getCurrentUser } = await import("@/actions/auth.actions");
    const user = await getCurrentUser(session.user.id);
    if (user && user.githubUsername) {
      githubUsername = user.githubUsername;
    }
  }

  return (
    <Suspense fallback={
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <GithubClient 
        userId={session?.user?.id || ""} 
        initialUsername={githubUsername} 
      />
    </Suspense>
  );
}
