"use client";

import { useMemo } from "react";
import { format, eachDayOfInterval, subDays } from "date-fns";

interface HeatmapDataPoint {
  date: string;
  count: number;
  level: number;
}

interface ContributionHeatmapProps {
  data: HeatmapDataPoint[];
}

const LEVEL_COLORS_DARK = [
  "#1f1f2e",   // 0 - empty
  "#2d1b69",   // 1 - low
  "#4c1d95",   // 2 - medium
  "#7c3aed",   // 3 - high
  "#a78bfa",   // 4 - very high
];

const LEVEL_COLORS_LIGHT = [
  "#f1f5f9",   // 0 - empty
  "#ddd6fe",   // 1 - low
  "#a78bfa",   // 2 - medium
  "#7c3aed",   // 3 - high
  "#5b21b6",   // 4 - very high
];

export function ContributionHeatmap({ data }: ContributionHeatmapProps) {
  const dataMap = useMemo(() => {
    const map = new Map<string, HeatmapDataPoint>();
    data.forEach((d) => map.set(d.date, d));
    return map;
  }, [data]);

  const days = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 89);
    return eachDayOfInterval({ start, end });
  }, []);

  // Group by week
  const weeks = useMemo(() => {
    const weekArray: Date[][] = [];
    let currentWeek: Date[] = [];

    days.forEach((day, i) => {
      const dayOfWeek = day.getDay(); // 0 = Sun
      if (i === 0) {
        // Pad start of first week with null
        for (let j = 0; j < dayOfWeek; j++) {
          currentWeek.push(null as unknown as Date);
        }
      }
      currentWeek.push(day);
      if (dayOfWeek === 6 || i === days.length - 1) {
        weekArray.push(currentWeek);
        currentWeek = [];
      }
    });

    return weekArray;
  }, [days]);

  const DAYS_OF_WEEK = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-2">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1 flex-shrink-0">
          <div className="h-5" /> {/* spacer for month row */}
          {DAYS_OF_WEEK.map((day, i) => (
            <div
              key={i}
              className="h-3 w-3 text-center text-xs leading-3 flex items-center"
              style={{
                color: "var(--color-muted-foreground)",
                fontSize: "9px",
              }}
            >
              {i % 2 === 0 ? day : ""}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1 flex-shrink-0">
            {/* Month label on first of month */}
            <div className="h-5 text-xs" style={{ color: "var(--color-muted-foreground)", fontSize: "9px" }}>
              {week.find((d) => d && d.getDate() <= 7)
                ? format(week.find((d) => d && d.getDate() <= 7)!, "MMM")
                : ""}
            </div>
            {week.map((day, di) => {
              if (!day) {
                return <div key={di} className="w-3 h-3" />;
              }

              const dateStr = format(day, "yyyy-MM-dd");
              const entry = dataMap.get(dateStr);
              const level = entry?.level ?? 0;
              const count = entry?.count ?? 0;

              return (
                <div
                  key={di}
                  title={`${dateStr}: ${count} pts`}
                  className="w-3 h-3 rounded-sm cursor-default transition-transform hover:scale-125"
                  style={{
                    background: LEVEL_COLORS_DARK[level],
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3">
        <span
          className="text-xs"
          style={{ color: "var(--color-muted-foreground)", fontSize: "10px" }}
        >
          Less
        </span>
        {LEVEL_COLORS_DARK.map((color, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{ background: color }}
          />
        ))}
        <span
          className="text-xs"
          style={{ color: "var(--color-muted-foreground)", fontSize: "10px" }}
        >
          More
        </span>
      </div>
    </div>
  );
}
