import { getJournals, getTodayJournal } from "@/actions/journal.actions";
import { JournalClient } from "@/components/journal/JournalClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Journal — JobOS" };

export default async function JournalPage() {
  const [journals, todayJournal] = await Promise.all([
    getJournals(),
    getTodayJournal()
  ]);
  
  return <JournalClient initialJournals={journals} initialToday={todayJournal} />;
}
