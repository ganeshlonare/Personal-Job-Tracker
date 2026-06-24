import { CalendarClient } from "@/components/calendar/CalendarClient";

export const metadata = {
  title: "Calendar | JobOS",
  description: "Track interviews, deadlines, and study sessions",
};

import { getCalendarEvents } from "@/actions/calendar.actions";

export default async function CalendarPage() {
  const events = await getCalendarEvents();
  
  return (
    <div className="space-y-6">
      <CalendarClient initialEvents={events} />
    </div>
  );
}
