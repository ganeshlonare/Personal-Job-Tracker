export const APP_NAME = "JobOS";
export const APP_DESCRIPTION = "The Personal Operating System for Job Seekers";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Application statuses
export const APPLICATION_STATUSES = [
  { value: "wishlist", label: "Wishlist", color: "#8B8B8B" },
  { value: "planning", label: "Planning", color: "#6366F1" },
  { value: "applied", label: "Applied", color: "#3B82F6" },
  { value: "assessment_received", label: "Assessment Received", color: "#8B5CF6" },
  { value: "assessment_completed", label: "Assessment Completed", color: "#A855F7" },
  { value: "interview_scheduled", label: "Interview Scheduled", color: "#EC4899" },
  { value: "technical_round", label: "Technical Round", color: "#F59E0B" },
  { value: "manager_round", label: "Manager Round", color: "#F97316" },
  { value: "hr_round", label: "HR Round", color: "#EAB308" },
  { value: "final_round", label: "Final Round", color: "#10B981" },
  { value: "offer", label: "Offer", color: "#22C55E" },
  { value: "accepted", label: "Accepted", color: "#059669" },
  { value: "rejected", label: "Rejected", color: "#EF4444" },
  { value: "ghosted", label: "Ghosted", color: "#6B7280" },
  { value: "withdrawn", label: "Withdrawn", color: "#9CA3AF" },
] as const;

export const PRIORITIES = [
  { value: "low", label: "Low", color: "#6B7280" },
  { value: "medium", label: "Medium", color: "#F59E0B" },
  { value: "high", label: "High", color: "#F97316" },
  { value: "critical", label: "Critical", color: "#EF4444" },
] as const;

export const TASK_CATEGORIES = [
  { value: "leetcode", label: "LeetCode", icon: "Code2", color: "#F59E0B" },
  { value: "application", label: "Application", icon: "Send", color: "#3B82F6" },
  { value: "study", label: "Study", icon: "BookOpen", color: "#8B5CF6" },
  { value: "project", label: "Project", icon: "Folder", color: "#10B981" },
  { value: "interview", label: "Interview", icon: "Video", color: "#EC4899" },
  { value: "networking", label: "Networking", icon: "Users", color: "#06B6D4" },
  { value: "other", label: "Other", icon: "MoreHorizontal", color: "#6B7280" },
] as const;

export const LEETCODE_DIFFICULTIES = [
  { value: "easy", label: "Easy", color: "#22C55E" },
  { value: "medium", label: "Medium", color: "#F59E0B" },
  { value: "hard", label: "Hard", color: "#EF4444" },
] as const;

export const LEETCODE_TOPICS = [
  "Array", "String", "Hash Table", "Dynamic Programming",
  "Math", "Sorting", "Greedy", "Depth-First Search",
  "Binary Search", "Breadth-First Search", "Tree", "Matrix",
  "Two Pointers", "Bit Manipulation", "Stack", "Heap",
  "Graph", "Linked List", "Sliding Window", "Backtracking",
  "Recursion", "Divide and Conquer", "Trie", "Union Find",
  "Design", "Binary Tree", "Monotonic Stack", "Segment Tree",
] as const;

export const STUDY_SUBJECTS = [
  { value: "java", label: "Java", color: "#F89820" },
  { value: "spring_boot", label: "Spring Boot", color: "#6DB33F" },
  { value: "dsa", label: "DSA", color: "#E34F26" },
  { value: "system_design", label: "System Design", color: "#3B82F6" },
  { value: "os", label: "Operating Systems", color: "#8B5CF6" },
  { value: "dbms", label: "DBMS", color: "#336791" },
  { value: "cn", label: "Computer Networks", color: "#06B6D4" },
  { value: "projects", label: "Projects", color: "#10B981" },
  { value: "devops", label: "DevOps", color: "#F97316" },
  { value: "javascript", label: "JavaScript", color: "#F7DF1E" },
  { value: "react", label: "React", color: "#61DAFB" },
  { value: "python", label: "Python", color: "#3776AB" },
] as const;

export const MOODS = [
  { value: "great", label: "Great", emoji: "😄" },
  { value: "good", label: "Good", emoji: "🙂" },
  { value: "okay", label: "Okay", emoji: "😐" },
  { value: "bad", label: "Bad", emoji: "😔" },
  { value: "terrible", label: "Terrible", emoji: "😢" },
] as const;

// Scoring system
export const SCORE_POINTS = {
  application: 10,
  leetcode_easy: 3,
  leetcode_medium: 5,
  leetcode_hard: 8,
  study_hour: 8,
  project_hour: 10,
  mock_interview: 15,
  recruiter_outreach: 8,
  linkedin_post: 5,
  cs_reading: 5,
  journal_entry: 3,
  all_tasks_bonus: 20,
} as const;

// Motivational quotes
export const MOTIVATIONAL_QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Your limitation—it's only your imagination.", author: "Unknown" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "Do something today that your future self will thank you for.", author: "Unknown" },
  { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
] as const;

export const PLATFORMS = [
  "LinkedIn", "Naukri", "Indeed", "Glassdoor", "AngelList",
  "Wellfound", "Company Website", "Referral", "Campus Placement",
  "Internshala", "Unstop", "HackerRank", "HackerEarth", "Other",
] as const;

export const REMOTE_OPTIONS = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
] as const;

// Sidebar navigation items
export const SIDEBAR_ITEMS = [
  { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { title: "Today's Mission", href: "/today", icon: "Target" },
  { title: "Applications", href: "/applications", icon: "Send" },
  { title: "Cold Mails", href: "/cold-mails", icon: "Mail" },
  { title: "Companies", href: "/companies", icon: "Building2" },
  { title: "Interviews", href: "/interviews", icon: "Video" },
  { title: "LeetCode", href: "/leetcode", icon: "Code2" },
  { title: "Projects", href: "/projects", icon: "FolderKanban" },
  { title: "Study Tracker", href: "/study", icon: "BookOpen" },
  { title: "Goals", href: "/goals", icon: "Trophy" },
  { title: "Calendar", href: "/calendar", icon: "Calendar" },
  { title: "Analytics", href: "/analytics", icon: "BarChart3" },
  // { title: "Resume Manager", href: "/resumes", icon: "FileText" },
  // { title: "Documents", href: "/documents", icon: "Archive" },
  { title: "Achievements", href: "/achievements", icon: "Award" },
  { title: "Journal", href: "/journal", icon: "PenLine" },
  { title: "Settings", href: "/settings", icon: "Settings" },
] as const;

// Document categories
export const DOCUMENT_CATEGORIES = [
  { value: "resume", label: "Resume" },
  { value: "cover_letter", label: "Cover Letter" },
  { value: "offer_letter", label: "Offer Letter" },
  { value: "certificate", label: "Certificate" },
  { value: "transcript", label: "Transcript" },
  { value: "notes", label: "Notes" },
  { value: "image", label: "Image" },
  { value: "other", label: "Other" },
] as const;
