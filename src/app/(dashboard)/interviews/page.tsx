import { getInterviews } from "@/actions/interview.actions";
import { InterviewsClient } from "@/components/interviews/InterviewsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Interviews — JobOS" };

export default async function InterviewsPage() {
  const interviews = await getInterviews();
  return <InterviewsClient initialInterviews={interviews} />;
}
