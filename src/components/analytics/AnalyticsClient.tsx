"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import { Activity, Briefcase, Code2, Target } from "lucide-react";

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

const activityData = [
  { name: "Mon", applications: 4, leetcode: 2, study: 3 },
  { name: "Tue", applications: 3, leetcode: 5, study: 4 },
  { name: "Wed", applications: 2, leetcode: 3, study: 5 },
  { name: "Thu", applications: 6, leetcode: 4, study: 2 },
  { name: "Fri", applications: 5, leetcode: 6, study: 4 },
  { name: "Sat", applications: 1, leetcode: 8, study: 6 },
  { name: "Sun", applications: 0, leetcode: 4, study: 3 },
];

const funnelData = [
  { name: "Applied", value: 120 },
  { name: "Assessment", value: 45 },
  { name: "Interview", value: 15 },
  { name: "Offer", value: 2 },
];

export function AnalyticsClient() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>
          Analytics & Insights
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>
          Data-driven insights into your job hunt performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Application Conversion", value: "12.5%", trend: "+2.1%", icon: <Briefcase className="w-5 h-5 text-blue-500" /> },
          { label: "Algorithm Win Rate", value: "68%", trend: "+5.4%", icon: <Code2 className="w-5 h-5 text-green-500" /> },
          { label: "Productivity Score", value: "85/100", trend: "+1.2", icon: <Activity className="w-5 h-5 text-indigo-500" /> },
          { label: "Goal Completion", value: "92%", trend: "+4%", icon: <Target className="w-5 h-5 text-purple-500" /> },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-secondary)] flex items-center justify-center">
                {stat.icon}
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                {stat.trend}
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--color-foreground)" }}>{stat.value}</p>
            <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Breakdown */}
        <motion.div variants={itemVariants} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6">
          <h3 className="font-semibold mb-6" style={{ color: "var(--color-foreground)" }}>Weekly Activity Breakdown</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", borderRadius: "12px", color: "var(--color-foreground)" }}
                  cursor={{ fill: "var(--color-secondary)" }}
                />
                <Bar dataKey="applications" name="Applications" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} />
                <Bar dataKey="leetcode" name="LeetCode" stackId="a" fill="#10B981" />
                <Bar dataKey="study" name="Study Hours" stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Application Funnel */}
        <motion.div variants={itemVariants} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6">
          <h3 className="font-semibold mb-6" style={{ color: "var(--color-foreground)" }}>Application Funnel</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", borderRadius: "12px", color: "var(--color-foreground)" }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
