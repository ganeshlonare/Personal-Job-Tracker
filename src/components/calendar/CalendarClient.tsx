"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Video, X, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createCalendarEvent } from "@/actions/calendar.actions";

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export interface ICalendarEvent {
  _id: string;
  title: string;
  type: "interview" | "deadline" | "study" | "other";
  date: string | Date;
  time: string;
  location?: string;
}

export function CalendarClient({ initialEvents }: { initialEvents: ICalendarEvent[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<ICalendarEvent[]>(initialEvents);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string>("");

  const [form, setForm] = useState({
    title: "",
    type: "other" as ICalendarEvent["type"],
    time: "10:00 AM",
    location: "",
  });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (clickedDate < today) {
      toast.error("Cannot add events for past dates!");
      return;
    }

    const dateStr = `${clickedDate.getFullYear()}-${String(clickedDate.getMonth() + 1).padStart(2, '0')}-${String(clickedDate.getDate()).padStart(2, '0')}`;
    setSelectedDateStr(dateStr);
    setShowAddForm(true);
  };

  const handleAddSubmit = async () => {
    if (!form.title || !selectedDateStr || !form.time) return;
    setIsAdding(true);
    try {
      const payload = {
        title: form.title,
        type: form.type,
        time: form.time,
        location: form.location,
        date: new Date(selectedDateStr),
      };
      
      const res = await createCalendarEvent(payload);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      
      setEvents(prev => [...prev, { ...payload, _id: res.id!, date: payload.date.toISOString() }]);
      toast.success("Event added!");
      setShowAddForm(false);
      setForm({ title: "", type: "other", time: "10:00 AM", location: "" });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto space-y-6"
    >
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl p-6 shadow-2xl" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold" style={{ color: "var(--color-foreground)" }}>New Event</h3>
                <button onClick={() => setShowAddForm(false)} className="p-1.5 rounded-lg hover:bg-[var(--color-secondary)] transition-colors cursor-pointer" style={{ color: "var(--color-muted-foreground)" }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--color-muted-foreground)" }}>Event Title *</label>
                  <input placeholder="E.g. Meta Phone Screen" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="px-3 py-2 rounded-xl text-sm outline-none bg-[var(--color-secondary)] text-[var(--color-foreground)] border border-[var(--color-border)] w-full focus:ring-2 focus:ring-indigo-500/50" autoFocus />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--color-muted-foreground)" }}>Event Type</label>
                    <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ICalendarEvent["type"] }))} className="px-3 py-2 rounded-xl text-sm outline-none bg-[var(--color-secondary)] text-[var(--color-foreground)] border border-[var(--color-border)] w-full focus:ring-2 focus:ring-indigo-500/50">
                      <option value="other">General</option>
                      <option value="interview">Interview</option>
                      <option value="study">Study Session</option>
                      <option value="deadline">Deadline</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--color-muted-foreground)" }}>Date *</label>
                    <input type="date" value={selectedDateStr} onChange={(e) => setSelectedDateStr(e.target.value)} className="px-3 py-2 rounded-xl text-sm outline-none bg-[var(--color-secondary)] text-[var(--color-foreground)] border border-[var(--color-border)] w-full focus:ring-2 focus:ring-indigo-500/50" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--color-muted-foreground)" }}>Time *</label>
                    <input placeholder="e.g. 10:00 AM" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} className="px-3 py-2 rounded-xl text-sm outline-none bg-[var(--color-secondary)] text-[var(--color-foreground)] border border-[var(--color-border)] w-full focus:ring-2 focus:ring-indigo-500/50" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--color-muted-foreground)" }}>Location / Link</label>
                    <input placeholder="Zoom, Meet, NYC..." value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="px-3 py-2 rounded-xl text-sm outline-none bg-[var(--color-secondary)] text-[var(--color-foreground)] border border-[var(--color-border)] w-full focus:ring-2 focus:ring-indigo-500/50" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[var(--color-border)]">
                <button onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-secondary)] transition-colors cursor-pointer" style={{ color: "var(--color-muted-foreground)" }}>Cancel</button>
                <button onClick={handleAddSubmit} disabled={isAdding || !form.title || !form.time || !selectedDateStr}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-60 transition-transform active:scale-95 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Save Event
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>
            Calendar
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>
            Track interviews, deadlines, and study sessions
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-secondary)] transition-colors cursor-pointer">
            Today
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
              setSelectedDateStr(dateStr);
              setShowAddForm(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 shadow-sm cursor-pointer"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
          >
            <CalendarIcon className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Calendar Area */}
        <motion.div variants={itemVariants} className="lg:flex-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ color: "var(--color-foreground)" }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-secondary)] transition-colors text-[var(--color-foreground)] cursor-pointer">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-secondary)] transition-colors text-[var(--color-foreground)] cursor-pointer">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-[var(--color-border)] rounded-xl overflow-hidden border border-[var(--color-border)]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="bg-[var(--color-secondary)] py-2 text-center text-xs font-semibold" style={{ color: "var(--color-muted-foreground)" }}>
                {day}
              </div>
            ))}
            
            {blanks.map(blank => (
              <div key={`blank-${blank}`} className="bg-[var(--color-card)] min-h-[100px] p-2 opacity-50"></div>
            ))}
            
            {days.map(day => {
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = events.filter(e => {
                const eDate = new Date(e.date);
                return eDate.getFullYear() === currentDate.getFullYear() && 
                       eDate.getMonth() === currentDate.getMonth() && 
                       eDate.getDate() === day;
              });
              const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
              
              return (
                <div key={day} onClick={() => handleDayClick(day)} className={`bg-[var(--color-card)] min-h-[100px] p-2 border-t border-[var(--color-border)] transition-colors hover:bg-[var(--color-secondary)]/50 cursor-pointer ${isToday ? "ring-2 ring-inset ring-indigo-500" : ""}`}>
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday ? "bg-indigo-500 text-white" : "text-[var(--color-foreground)]"}`}>
                    {day}
                  </span>
                  <div className="space-y-1">
                    {dayEvents.map((event, i) => (
                      <div 
                        key={i} 
                        className="text-[10px] px-1.5 py-1 rounded truncate font-medium"
                        style={{ 
                          background: event.type === 'interview' ? 'rgba(99,102,241,0.1)' : event.type === 'deadline' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                          color: event.type === 'interview' ? '#6366F1' : event.type === 'deadline' ? '#EF4444' : '#22C55E'
                        }}
                      >
                        {event.time} {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Upcoming Sidebar */}
        <motion.div variants={itemVariants} className="lg:w-80 flex-shrink-0 space-y-6">
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
              <Clock className="w-4 h-4 text-indigo-500" />
              Upcoming Events
            </h3>
            <div className="space-y-4">
              {events
                .filter(e => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map((event, i) => {
                  const eDate = new Date(event.date);
                  return (
                    <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-[var(--color-secondary)] transition-colors border border-transparent hover:border-[var(--color-border)] cursor-pointer">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 font-bold flex-shrink-0">
                        <span className="text-xs font-medium opacity-80">{monthNames[eDate.getMonth()].slice(0,3)}</span>
                        <span>{eDate.getDate()}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-1" style={{ color: "var(--color-foreground)" }}>{event.title}</h4>
                        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                          <Clock className="w-3 h-3" /> {event.time}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>
                            {event.type === 'interview' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />} {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  );
              })}
              {events.length === 0 && (
                <div className="text-sm text-center py-4" style={{ color: "var(--color-muted-foreground)" }}>
                  No upcoming events
                </div>
              )}
            </div>
            
            <button className="w-full mt-4 py-2 text-sm font-medium rounded-xl border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-secondary)] transition-colors">
              View All
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
