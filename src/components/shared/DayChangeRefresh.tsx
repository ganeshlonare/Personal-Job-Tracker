"use client";

import { useDayChangeRefresh } from "@/hooks/useDayChangeRefresh";

/**
 * Client component that enables automatic page refresh when the day changes.
 * This should be placed in the dashboard layout to ensure all pages refresh at midnight.
 */
export function DayChangeRefresh() {
  useDayChangeRefresh();
  return null;
}
