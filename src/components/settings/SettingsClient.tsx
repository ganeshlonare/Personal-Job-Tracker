"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, User, Bell, Shield, Palette, Smartphone, Mail, Globe } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const settingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  targetCompany: z.string().optional(),
  targetSalary: z.string().optional(),
  theme: z.enum(["light", "dark", "system"]),
  emailNotifications: z.boolean(),
  browserNotifications: z.boolean(),
  weeklyReport: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

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

export function SettingsClient() {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: "Ganesh Lonare",
      email: "ganeshlonare311@gmail.com",
      targetCompany: "Google",
      targetSalary: "120000",
      theme: "dark",
      emailNotifications: true,
      browserNotifications: false,
      weeklyReport: true,
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
    setIsSaving(true);
    // Mock save delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Settings saved:", data);
    setIsSaving(false);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { id: "preferences", label: "Preferences", icon: <Palette className="w-4 h-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
    { id: "security", label: "Security", icon: <Shield className="w-4 h-4" /> },
  ];

  const cardStyle = {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>
            Settings
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>
            Manage your account preferences and configurations
          </p>
        </div>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
          style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <motion.div variants={itemVariants} className="md:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-indigo-500/10 text-indigo-500"
                  : "hover:bg-[var(--color-secondary)] text-[var(--color-muted-foreground)]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Content Area */}
        <motion.div variants={itemVariants} className="md:col-span-3 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Profile Settings */}
            {activeTab === "profile" && (
              <div className="p-6 rounded-2xl" style={cardStyle}>
                <h2 className="text-lg font-semibold mb-6" style={{ color: "var(--color-foreground)" }}>
                  Public Profile
                </h2>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    GL
                  </div>
                  <div>
                    <button type="button" className="px-4 py-2 text-sm font-medium rounded-lg mb-2" style={{ background: "var(--color-secondary)", color: "var(--color-foreground)" }}>
                      Change Avatar
                    </button>
                    <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                      JPG, GIF or PNG. 1MB max.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>Full Name</label>
                    <input
                      {...register("name")}
                      className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                      style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>Email Address</label>
                    <input
                      {...register("email")}
                      type="email"
                      className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                      style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>Target Company (Optional)</label>
                    <input
                      {...register("targetCompany")}
                      placeholder="e.g. Google, Microsoft"
                      className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                      style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>Target Salary (Optional)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--color-muted-foreground)" }}>$</span>
                      <input
                        {...register("targetSalary")}
                        type="number"
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                        style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Settings */}
            {activeTab === "preferences" && (
              <div className="p-6 rounded-2xl" style={cardStyle}>
                <h2 className="text-lg font-semibold mb-6" style={{ color: "var(--color-foreground)" }}>
                  Appearance & Preferences
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-3 block" style={{ color: "var(--color-foreground)" }}>Theme</label>
                    <div className="grid grid-cols-3 gap-4">
                      {(["light", "dark", "system"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setValue("theme", t)}
                          className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                            watch("theme") === t ? "border-indigo-500 bg-indigo-500/5" : "border-[var(--color-border)] hover:bg-[var(--color-secondary)]"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t === 'dark' ? 'bg-zinc-900 text-white' : t === 'light' ? 'bg-white text-zinc-900 border' : 'bg-gradient-to-tr from-zinc-200 to-zinc-800 text-white'}`}>
                            {t === 'light' ? <Shield className="w-4 h-4"/> : t === 'dark' ? <Globe className="w-4 h-4"/> : <Smartphone className="w-4 h-4"/>}
                          </div>
                          <span className="text-sm font-medium capitalize" style={{ color: "var(--color-foreground)" }}>{t}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === "notifications" && (
              <div className="p-6 rounded-2xl" style={cardStyle}>
                <h2 className="text-lg font-semibold mb-6" style={{ color: "var(--color-foreground)" }}>
                  Notification Preferences
                </h2>

                <div className="space-y-4">
                  {[
                    { id: "emailNotifications", title: "Email Notifications", desc: "Receive emails about your application updates.", icon: <Mail className="w-5 h-5" /> },
                    { id: "browserNotifications", title: "Browser Notifications", desc: "Get desktop alerts for reminders.", icon: <Globe className="w-5 h-5" /> },
                    { id: "weeklyReport", title: "Weekly Progress Report", desc: "Receive a weekly summary of your job hunt.", icon: <Bell className="w-5 h-5" /> },
                  ].map((item) => (
                    <div key={item.id} className="flex items-start justify-between p-4 rounded-xl" style={{ background: "var(--color-background)", border: "1px solid var(--color-border)" }}>
                      <div className="flex gap-4">
                        <div className="mt-1" style={{ color: "var(--color-muted-foreground)" }}>{item.icon}</div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>{item.title}</p>
                          <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>{item.desc}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" {...register(item.id as keyof SettingsFormValues)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="p-6 rounded-2xl" style={cardStyle}>
                <h2 className="text-lg font-semibold mb-6" style={{ color: "var(--color-foreground)" }}>
                  Security & Password
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "var(--color-background)", border: "1px solid var(--color-border)" }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>Change Password</p>
                      <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>Last changed 3 months ago</p>
                    </div>
                    <button type="button" className="px-4 py-2 text-sm font-medium rounded-lg" style={{ background: "var(--color-secondary)", color: "var(--color-foreground)" }}>
                      Update
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "var(--color-background)", border: "1px solid var(--color-border)" }}>
                    <div>
                      <p className="text-sm font-medium text-red-500">Delete Account</p>
                      <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>Permanently delete your account and all data</p>
                    </div>
                    <button type="button" className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
