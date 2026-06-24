// ============================================
// JobOS Type Definitions
// ============================================

export type ApplicationStatus =
  | "wishlist" | "planning" | "applied" | "assessment_received"
  | "assessment_completed" | "interview_scheduled" | "technical_round"
  | "manager_round" | "hr_round" | "final_round" | "offer"
  | "accepted" | "rejected" | "ghosted" | "withdrawn";

export type Priority = "low" | "medium" | "high" | "critical";
export type RemoteType = "remote" | "hybrid" | "onsite";
export type TaskCategory = "leetcode" | "application" | "study" | "project" | "interview" | "networking" | "other";
export type LeetcodeDifficulty = "easy" | "medium" | "hard";
export type LeetcodeStatus = "attempted" | "solved" | "needs_revision";
export type ProjectStatus = "planning" | "in_progress" | "completed" | "paused";
export type GoalStatus = "active" | "completed" | "paused" | "failed";
export type Mood = "great" | "good" | "okay" | "bad" | "terrible";
export type InterviewResult = "passed" | "failed" | "pending" | "cancelled";
export type ReportType = "daily" | "weekly" | "monthly";
export type HiringFrequency = "always" | "seasonal" | "rare";
export type DocumentCategory = "resume" | "cover_letter" | "offer_letter" | "certificate" | "transcript" | "notes" | "image" | "other";
export type StudyType = "study" | "revision" | "practice";

// ============================================
// User
// ============================================
export interface IUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  avatar?: string;
  targetCompany?: string;
  dreamCompany?: string;
  targetSalary?: number;
  preferredTechStack: string[];
  leetcodeUsername?: string;
  dailyGoal: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: Date;
  lifetimeScore: number;
  theme: "light" | "dark" | "system";
  notificationSettings: {
    email: boolean;
    browser: boolean;
    dailyReport: boolean;
    weeklyReport: boolean;
  };
  onboarding: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Application
// ============================================
export interface ITimelineEntry {
  status: string;
  date: Date;
  note?: string;
}

export interface IReferral {
  name: string;
  contact: string;
  relationship: string;
}

export interface ICustomLabel {
  key: string;
  value: string;
}

export interface IApplication {
  _id: string;
  userId: string;
  company: string;
  companyLogo?: string;
  role: string;
  location?: string;
  remote?: RemoteType;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  platform?: string;
  appliedDate?: Date;
  deadline?: Date;
  resumeVersion?: string;
  coverLetter?: string;
  recruiterName?: string;
  recruiterLinkedIn?: string;
  recruiterEmail?: string;
  jobLink?: string;
  careerPage?: string;
  status: ApplicationStatus;
  priority: Priority;
  notes?: string;
  expectedResponseDate?: Date;
  referral?: IReferral;
  tags: string[];
  customLabels: ICustomLabel[];
  timeline: ITimelineEntry[];
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Company
// ============================================
export interface IContact {
  name: string;
  role: string;
  email?: string;
  linkedin?: string;
  notes?: string;
}

export interface IResponseHistory {
  applicationId: string;
  status: string;
  responseTime: number;
  date: Date;
}

export interface ICompany {
  _id: string;
  userId: string;
  name: string;
  logo?: string;
  industry?: string;
  website?: string;
  careerPage?: string;
  hiringFrequency?: HiringFrequency;
  lastApplied?: Date;
  applicationCount: number;
  contacts: IContact[];
  notes?: string;
  priority: Priority;
  favorite: boolean;
  responseHistory: IResponseHistory[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Task
// ============================================
export interface ITask {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  timeEstimate?: number;
  timeSpent: number;
  completed: boolean;
  completedAt?: Date;
  date: Date;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Goal
// ============================================
export interface IMilestone {
  title: string;
  value: number;
  reached: boolean;
  reachedAt?: Date;
}

export interface IGoal {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: Date;
  milestones: IMilestone[];
  dailyTarget: number;
  status: GoalStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// LeetCode
// ============================================
export interface ILeetcode {
  _id: string;
  userId: string;
  problemName: string;
  problemNumber?: number;
  difficulty: LeetcodeDifficulty;
  topic: string[];
  timeTaken?: number;
  mistakes?: string;
  revisionRequired: boolean;
  notes?: string;
  status: LeetcodeStatus;
  bookmarked: boolean;
  solvedDate: Date;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Project
// ============================================
export interface IProjectMilestone {
  title: string;
  completed: boolean;
  completedAt?: Date;
}

export interface IProjectTask {
  title: string;
  completed: boolean;
  completedAt?: Date;
}

export interface IDailyLog {
  date: Date;
  hours: number;
  notes?: string;
}

export interface IProject {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  techStack: string[];
  progress: number;
  status: ProjectStatus;
  githubLink?: string;
  demoLink?: string;
  deploymentUrl?: string;
  milestones: IProjectMilestone[];
  tasks: IProjectTask[];
  dailyLogs: IDailyLog[];
  images: string[];
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Study Session
// ============================================
export interface IStudySession {
  _id: string;
  userId: string;
  subject: string;
  topic?: string;
  duration: number;
  pomodoroCount: number;
  notes?: string;
  date: Date;
  type: StudyType;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Interview
// ============================================
export interface IInterview {
  _id: string;
  userId: string;
  company: string;
  role: string;
  date: Date;
  round: string;
  questionsAsked: string[];
  behavioralQuestions: string[];
  codingQuestions: string[];
  mistakes?: string;
  topicsToRevise: string[];
  interviewerFeedback?: string;
  personalRating?: number;
  result: InterviewResult;
  applicationId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Resume
// ============================================
export interface IResume {
  _id: string;
  userId: string;
  name: string;
  version: string;
  fileUrl?: string;
  fileKey?: string;
  lastUpdated: Date;
  applicationCount: number;
  responseCount: number;
  interviewCount: number;
  active: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Document
// ============================================
export interface IDocument {
  _id: string;
  userId: string;
  name: string;
  category: DocumentCategory;
  fileUrl?: string;
  fileKey?: string;
  fileSize?: number;
  mimeType?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Achievement
// ============================================
export interface IAchievement {
  _id: string;
  userId: string;
  achievementId: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  unlockedAt?: Date;
  progress: number;
  target: number;
  unlocked: boolean;
}

// ============================================
// Journal
// ============================================
export interface IJournal {
  _id: string;
  userId: string;
  date: Date;
  entry: string;
  wins: string[];
  challenges: string[];
  gratitude: string[];
  mood: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Daily Score
// ============================================
export interface IDailyScore {
  _id: string;
  userId: string;
  date: Date;
  score: number;
  breakdown: {
    applications: number;
    leetcode: number;
    study: number;
    project: number;
    interview: number;
    networking: number;
    other: number;
  };
  tasksCompleted: number;
  totalTasks: number;
  createdAt: Date;
}

// ============================================
// Report
// ============================================
export interface IReport {
  _id: string;
  userId: string;
  type: ReportType;
  date: Date;
  startDate: Date;
  endDate: Date;
  content: {
    completed: string[];
    notCompleted: string[];
    productivityScore: number;
    hoursStudied: number;
    applicationsSent: number;
    leetcodeSolved: number;
    projectWork: number;
    streak: number;
    suggestions: string[];
  };
  aiSummary?: string;
  createdAt: Date;
}

// ============================================
// Dashboard Stats
// ============================================
export interface DashboardStats {
  currentStreak: number;
  todayScore: number;
  dailyTarget: number;
  weeklyApplications: number;
  totalApplications: number;
  responseRate: number;
  rejectionRate: number;
  interviewConversion: number;
  leetcodeSolved: number;
  studyMinutesToday: number;
  projectProgress: number;
}

// ============================================
// Heatmap Data
// ============================================
export interface HeatmapData {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

// ============================================
// Chart Data
// ============================================
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}
