import { getGoals } from "@/actions/goal.actions";
import { GoalsClient } from "@/components/goals/GoalsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Goals — JobOS" };

export default async function GoalsPage() {
  const goals = await getGoals();
  return <GoalsClient initialGoals={goals} />;
}
