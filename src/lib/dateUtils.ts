import { format, isSameDay } from "date-fns";

/**
 * Returns the local date string in YYYY-MM-DD format using the browser's local timezone.
 * Useful for initializing HTML date inputs properly without UTC shifting.
 */
export function getLocalDateString(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Checks if a given date string or Date object falls on the current local day.
 * It uses the local timezone for both the given date and "today".
 */
export function isTodayLocal(date: string | Date | undefined | null): boolean {
  if (!date) return false;
  return isSameDay(new Date(date), new Date());
}
