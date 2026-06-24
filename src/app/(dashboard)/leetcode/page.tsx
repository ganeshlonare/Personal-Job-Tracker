import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/actions/auth.actions";
import { LeetcodeClient } from "@/components/leetcode/LeetcodeClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LeetCode — JobOS",
  description: "Track your LeetCode progress",
};

export default async function LeetcodePage() {
  const session = await auth();
  
  let leetcodeUsername = "";
  if (session?.user?.id) {
    const user = await getCurrentUser(session.user.id);
    if (user && user.leetcodeUsername) {
      leetcodeUsername = user.leetcodeUsername;
    }
  }

  return <LeetcodeClient initialUsername={leetcodeUsername} userId={session?.user?.id || ""} />;
}
