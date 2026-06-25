"use client";

import { useEffect, useRef } from "react";

/**
 * Hook to detect when the day changes (after midnight) and trigger a page refresh.
 * This ensures that after 12 PM, all data automatically shifts to the new day.
 */
export function useDayChangeRefresh() {
  const currentDateRef = useRef(new Date().toDateString());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const todayString = now.toDateString();
      
      // If the date has changed, refresh the page
      if (todayString !== currentDateRef.current) {
        currentDateRef.current = todayString;
        window.location.reload();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);
}
