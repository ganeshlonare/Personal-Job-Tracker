import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobOS — The Personal Operating System for Job Seekers",
  description:
    "Track applications, manage interviews, solve LeetCode, study smarter, and land your dream software engineering job with JobOS.",
  keywords: [
    "job tracker",
    "application tracker",
    "interview preparation",
    "leetcode tracker",
    "software engineering jobs",
    "placement preparation",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "var(--color-card)",
                  color: "var(--color-card-foreground)",
                  border: "1px solid var(--color-border)",
                },
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
