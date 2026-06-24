"use client";

import { Download } from "lucide-react";
import { startOfDay, differenceInDays, addDays, format } from "date-fns";
import * as XLSX from "xlsx";

interface TimelineDownloadButtonProps {
  data: {
    userCreatedAt: string;
    tasks: any[];
    applications: any[];
    studySessions: any[];
    leetcodeSubmissions: any[];
    coldMails: any[];
  };
}

export function TimelineDownloadButton({ data }: TimelineDownloadButtonProps) {
  const downloadExcel = () => {
    // Process data to create timeline
    const startDate = startOfDay(new Date(data.userCreatedAt));
    const today = startOfDay(new Date());
    const totalDays = differenceInDays(today, startDate) + 1;

    // Grouping structure
    const daysMap = new Map<number, {
      date: Date;
      tasks: any[];
      applications: any[];
      studySessions: any[];
      leetcode: any[];
      coldMails: any[];
    }>();

    // Initialize all days
    for (let i = 0; i < totalDays; i++) {
      daysMap.set(i + 1, {
        date: addDays(startDate, i),
        tasks: [],
        applications: [],
        studySessions: [],
        leetcode: [],
        coldMails: [],
      });
    }

    // Helper to get day index
    const getDayIndex = (dateString: string | number | Date) => {
      let d: Date;
      if (typeof dateString === 'number') {
        d = new Date(dateString);
      } else if (typeof dateString === 'string') {
        d = new Date(dateString);
      } else {
        d = dateString;
      }
      const dayStart = startOfDay(d);
      const diff = differenceInDays(dayStart, startDate) + 1;
      return diff > 0 && diff <= totalDays ? diff : null;
    };

    // Assign Tasks - check multiple date fields
    data.tasks.forEach((t) => {
      const idx = getDayIndex(t.completedAt || t.date || t.createdAt);
      if (idx) daysMap.get(idx)?.tasks.push(t);
    });

    // Assign Applications - check appliedDate first
    data.applications.forEach((a) => {
      const idx = getDayIndex(a.appliedDate || a.createdAt);
      if (idx) daysMap.get(idx)?.applications.push(a);
    });

    // Assign Study Sessions
    data.studySessions.forEach((s) => {
      const idx = getDayIndex(s.date);
      if (idx) daysMap.get(idx)?.studySessions.push(s);
    });

    // Assign Cold Mails
    data.coldMails?.forEach((m) => {
      const idx = getDayIndex(m.date);
      if (idx) daysMap.get(idx)?.coldMails.push(m);
    });

    // Assign LeetCode - convert timestamp from seconds to milliseconds
    data.leetcodeSubmissions.forEach((sub) => {
      const secs = parseInt(sub.timestamp);
      if (!isNaN(secs)) {
        const idx = getDayIndex(secs * 1000);
        if (idx) daysMap.get(idx)?.leetcode.push(sub);
      }
    });

    const timelineArray = Array.from(daysMap.entries())
      .map(([dayNum, dayData]) => ({
        dayNum,
        ...dayData,
      }))
      .sort((a, b) => a.dayNum - b.dayNum); // Ascending order
    
    // Create worksheet data
    const worksheetData = [
      ["JobOS Activity Timeline", "", "", "", "", "", ""],
      [`Generated: ${format(new Date(), "MMMM dd, yyyy")}`, "", "", "", "", "", ""],
      [], // Empty row
      ["Day", "Date", "LeetCode Solved", "Tasks Completed", "Job Applications", "Study Hours", "Cold Mails Sent"],
    ];
    
    // Add data rows
    timelineArray.forEach(day => {
      const studyMinutes = day.studySessions.reduce((acc: number, curr: any) => acc + (curr.duration || 0), 0);
      const studyHours = (studyMinutes / 60).toFixed(1);
      
      worksheetData.push([
        `Day ${day.dayNum}`,
        format(day.date, "MMM dd, yyyy"),
        String(day.leetcode.length),
        String(day.tasks.filter((t: any) => t.completed).length),
        String(day.applications.length),
        studyHours,
        String(day.coldMails.length)
      ]);
    });
    
    // Add summary section
    const totalLeetcode = timelineArray.reduce((sum, day) => sum + day.leetcode.length, 0);
    const totalTasks = timelineArray.reduce((sum, day) => sum + day.tasks.filter((t: any) => t.completed).length, 0);
    const totalApplications = timelineArray.reduce((sum, day) => sum + day.applications.length, 0);
    const totalStudyMinutes = timelineArray.reduce((sum, day) => 
      sum + day.studySessions.reduce((acc: number, curr: any) => acc + (curr.duration || 0), 0), 0);
    const totalColdMails = timelineArray.reduce((sum, day) => sum + day.coldMails.length, 0);
    
    worksheetData.push([]);
    worksheetData.push(["=== SUMMARY ===", "", "", "", "", "", ""]);
    worksheetData.push([
      "TOTAL",
      "-",
      String(totalLeetcode),
      String(totalTasks),
      String(totalApplications),
      (totalStudyMinutes / 60).toFixed(1),
      String(totalColdMails)
    ]);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 12 }, // Day
      { wch: 15 }, // Date
      { wch: 15 }, // LeetCode
      { wch: 15 }, // Tasks
      { wch: 18 }, // Applications
      { wch: 12 }, // Study Hours
      { wch: 15 }, // Cold Mails
    ];
    
    XLSX.utils.book_append_sheet(wb, worksheet, "Activity Timeline");
    
    // Generate and download
    XLSX.writeFile(wb, `JobOS_Activity_Timeline_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  return (
    <button
      onClick={downloadExcel}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-[var(--color-secondary)] border"
      style={{ color: "var(--color-foreground)", borderColor: "var(--color-border)" }}
      title="Download complete timeline as Excel"
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Download Excel</span>
    </button>
  );
}
