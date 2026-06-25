"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays, startOfDay, addDays } from "date-fns";
import { Code2, CheckSquare, Briefcase, BookOpen, ChevronRight, Calendar as CalendarIcon, ExternalLink } from "lucide-react";

interface TimelineClientProps {
  data: {
    userCreatedAt: string;
    tasks: any[];
    applications: any[];
    studySessions: any[];
    leetcodeSubmissions: any[];
    coldMails: any[];
  };
}

export function TimelineClient({ data }: TimelineClientProps) {
  const [selectedDay, setSelectedDay] = useState<number>(0);

  const { timelineDays, maxDays } = useMemo(() => {
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
    const getDayIndex = (dateString: string | number) => {
      const d = startOfDay(new Date(dateString));
      const diff = differenceInDays(d, startDate) + 1;
      return diff > 0 && diff <= totalDays ? diff : null;
    };

    // Assign Tasks
    data.tasks.forEach((t) => {
      const idx = getDayIndex(t.completedAt || t.date || t.createdAt);
      if (idx) daysMap.get(idx)?.tasks.push(t);
    });

    // Assign Applications
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

    // Assign LeetCode
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
      .sort((a, b) => b.dayNum - a.dayNum); // Newest first

    return { timelineDays: timelineArray, maxDays: totalDays };
  }, [data]);

  // Set the default selected day to the most recent day upon load
  useMemo(() => {
    if (maxDays > 0 && selectedDay === 0) {
      setSelectedDay(maxDays);
    }
  }, [maxDays, selectedDay]);

  const currentDayData = timelineDays.find((d) => d.dayNum === selectedDay);

  const cardStyle = { background: "var(--color-card)", border: "1px solid var(--color-border)" };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      {/* Sidebar - List of Days */}
      <div className="md:col-span-4 lg:col-span-3 space-y-2 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-2">
        {timelineDays.map((day) => {
          const isSelected = selectedDay === day.dayNum;
          const hasActivity = day.tasks.length > 0 || day.applications.length > 0 || day.studySessions.length > 0 || day.leetcode.length > 0 || day.coldMails.length > 0;

          return (
            <button
              key={day.dayNum}
              onClick={() => setSelectedDay(day.dayNum)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                isSelected ? "border-primary bg-primary/10" : "hover:bg-[var(--color-secondary)] hover:border-foreground/20"
              }`}
              style={{
                borderColor: isSelected ? "var(--color-primary)" : "var(--color-border)",
                background: isSelected ? "var(--color-primary-10)" : "var(--color-card)",
              }}
            >
              <div>
                <h4 className={`font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>Day {day.dayNum}</h4>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" /> {format(day.date, "MMM do, yyyy")}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? "text-primary translate-x-1" : "text-muted-foreground group-hover:translate-x-1"}`} />
                {hasActivity ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[var(--color-border)]" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Content - Selected Day Details */}
      <div className="md:col-span-8 lg:col-span-9">
        <AnimatePresence mode="wait">
          {currentDayData ? (
            <motion.div
              key={currentDayData.dayNum}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="rounded-2xl p-6 border flex flex-col md:flex-row justify-between md:items-center gap-4" style={cardStyle}>
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
                    <span className="text-primary">Day {currentDayData.dayNum}</span> Activity
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(currentDayData.date, "EEEE, MMMM do, yyyy")}
                  </p>
                </div>
                
                {/* Day Summary Badges */}
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20">
                    <Code2 className="w-3.5 h-3.5" /> {currentDayData.leetcode.length} LeetCode
                  </div>
                  <div className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20">
                    <CheckSquare className="w-3.5 h-3.5" /> {currentDayData.tasks.length} Tasks
                  </div>
                  <div className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20">
                    <Briefcase className="w-3.5 h-3.5" /> {currentDayData.applications.length} Applied
                  </div>
                  <div className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-500/20">
                    <BookOpen className="w-3.5 h-3.5" /> {Math.round(currentDayData.studySessions.reduce((acc, curr) => acc + curr.duration, 0) / 60 * 10) / 10}h Studied
                  </div>
                  <div className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-500 border-cyan-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> 
                    {currentDayData.coldMails.length} Cold Mails
                  </div>
                </div>
              </div>

              {/* Detail Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* LeetCode Problems */}
                <div className="rounded-2xl border flex flex-col h-full" style={cardStyle}>
                  <div className="p-5 border-b" style={{ borderColor: "var(--color-border)" }}>
                    <h3 className="font-bold flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
                      <Code2 className="w-5 h-5 text-yellow-500" /> LeetCode Solved
                    </h3>
                  </div>
                  <div className="p-5 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
                    {currentDayData.leetcode.length > 0 ? (
                      <div className="space-y-3">
                        {currentDayData.leetcode.map((sub, i) => (
                          <a 
                            key={i} 
                            href={`https://leetcode.com/problems/${sub.titleSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 rounded-xl border hover:border-yellow-500/50 transition-colors group bg-[var(--color-secondary)]"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-sm group-hover:text-yellow-500 transition-colors" style={{ color: "var(--color-foreground)" }}>
                                {sub.title}
                              </span>
                              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-xs text-muted-foreground font-mono mt-2 block">{sub.lang}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-8">
                        <Code2 className="w-8 h-8 opacity-20 mb-2" />
                        <p className="text-sm">No LeetCode problems solved this day.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tasks */}
                <div className="rounded-2xl border flex flex-col h-full" style={cardStyle}>
                  <div className="p-5 border-b" style={{ borderColor: "var(--color-border)" }}>
                    <h3 className="font-bold flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
                      <CheckSquare className="w-5 h-5 text-emerald-500" /> Tasks
                    </h3>
                  </div>
                  <div className="p-5 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
                    {currentDayData.tasks.length > 0 ? (
                      <div className="space-y-3">
                        {currentDayData.tasks.map((task, i) => (
                          <div key={i} className={`p-3 rounded-xl border bg-[var(--color-secondary)] ${task.completed ? "opacity-60" : ""}`}>
                            <div className="flex items-center gap-2 mb-1">
                              {task.completed ? (
                                <CheckSquare className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                              )}
                              <h4 className={`font-semibold text-sm ${task.completed ? "line-through" : ""}`} style={{ color: "var(--color-foreground)" }}>{task.title}</h4>
                            </div>
                            {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2 pl-6">{task.description}</p>}
                            <div className="mt-2 ml-6 flex items-center gap-2">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium border" style={{ color: "var(--color-muted-foreground)", borderColor: "var(--color-border)" }}>
                                {task.category}
                              </span>
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium border" style={{ color: "var(--color-muted-foreground)", borderColor: "var(--color-border)" }}>
                                +{task.points} pts
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-8">
                        <CheckSquare className="w-8 h-8 opacity-20 mb-2" />
                        <p className="text-sm">No tasks for this day.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Applications */}
                <div className="rounded-2xl border flex flex-col h-full" style={cardStyle}>
                  <div className="p-5 border-b" style={{ borderColor: "var(--color-border)" }}>
                    <h3 className="font-bold flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
                      <Briefcase className="w-5 h-5 text-blue-500" /> Job Applications
                    </h3>
                  </div>
                  <div className="p-5 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
                    {currentDayData.applications.length > 0 ? (
                      <div className="space-y-3">
                        {currentDayData.applications.map((app, i) => (
                          <div key={i} className="p-3 rounded-xl border bg-[var(--color-secondary)] flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold text-sm" style={{ color: "var(--color-foreground)" }}>{app.role}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">{app.company}</p>
                            </div>
                            <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-[10px] font-bold tracking-wide uppercase">Applied</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-8">
                        <Briefcase className="w-8 h-8 opacity-20 mb-2" />
                        <p className="text-sm">No applications submitted.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Study Sessions */}
                <div className="rounded-2xl border flex flex-col h-full" style={cardStyle}>
                  <div className="p-5 border-b" style={{ borderColor: "var(--color-border)" }}>
                    <h3 className="font-bold flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
                      <BookOpen className="w-5 h-5 text-purple-500" /> Study Sessions
                    </h3>
                  </div>
                  <div className="p-5 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
                    {currentDayData.studySessions.length > 0 ? (
                      <div className="space-y-3">
                        {currentDayData.studySessions.map((session, i) => (
                          <div key={i} className="p-3 rounded-xl border bg-[var(--color-secondary)]">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate" style={{ color: "var(--color-foreground)" }}>{session.topic || "Study Session"}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">{session.subject}</p>
                              </div>
                              <span className="text-xs font-medium px-2 py-1 rounded bg-purple-500/10 text-purple-500 ml-2 flex-shrink-0">
                                {session.duration} mins
                              </span>
                            </div>
                            {session.type && (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium border mt-2" style={{ color: "var(--color-muted-foreground)", borderColor: "var(--color-border)" }}>
                                {session.type}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-8">
                        <BookOpen className="w-8 h-8 opacity-20 mb-2" />
                        <p className="text-sm">No study sessions recorded.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cold Mails */}
                <div className="rounded-2xl border flex flex-col h-full lg:col-span-2" style={cardStyle}>
                  <div className="p-5 border-b" style={{ borderColor: "var(--color-border)" }}>
                    <h3 className="font-bold flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                      Cold Mails Sent
                    </h3>
                  </div>
                  <div className="p-5 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
                    {currentDayData.coldMails.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentDayData.coldMails.map((mail, i) => (
                          <div key={i} className="p-3 rounded-xl border bg-[var(--color-secondary)] flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold text-sm" style={{ color: "var(--color-foreground)" }}>{mail.recipientName}</h4>
                              {mail.company && <p className="text-xs text-muted-foreground mt-0.5">{mail.company}</p>}
                            </div>
                            <span className="px-2 py-1 bg-cyan-500/10 text-cyan-500 rounded text-[10px] font-bold tracking-wide uppercase">{mail.status}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-8">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-20 mb-2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                        <p className="text-sm">No cold mails sent this day.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
