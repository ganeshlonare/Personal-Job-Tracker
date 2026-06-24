import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — JobOS",
  description: "Sign in to your JobOS account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left: Branding Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12"
        style={{
          background:
            "linear-gradient(135deg, #0F0F12 0%, #18181B 50%, #1e1b4b 100%)",
        }}
      >
        {/* Animated background orbs */}
        <div
          className="absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, #6366F1 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute top-1/2 -right-20 w-80 h-80 rounded-full opacity-15"
            style={{
              background:
                "radial-gradient(circle, #8B5CF6 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, #EC4899 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{
                background:
                  "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
              }}
            >
              J
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">
              JobOS
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Your Personal{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #818CF8 0%, #C084FC 50%, #F472B6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Operating System
            </span>{" "}
            for Job Seekers
          </h1>

          <p className="text-zinc-400 text-lg leading-relaxed mb-10">
            Track applications, crush LeetCode, prepare interviews, and land
            your dream software engineering job — all in one place.
          </p>

          {/* Feature list */}
          <div className="space-y-4">
            {[
              { emoji: "🎯", text: "Track 300+ job applications effortlessly" },
              { emoji: "🧠", text: "LeetCode progress with topic-wise analytics" },
              { emoji: "📊", text: "Real-time productivity score & streaks" },
              { emoji: "🏆", text: "Unlock achievements as you grind" },
            ].map(({ emoji, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-xl">{emoji}</span>
                <span className="text-zinc-300 text-sm">{text}</span>
              </div>
            ))}
          </div>

          {/* Stats strip */}
          <div
            className="mt-12 p-4 rounded-2xl flex gap-6"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {[
              { value: "15+", label: "Modules" },
              { value: "500+", label: "Points/Day" },
              { value: "∞", label: "Potential" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center flex-1">
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-zinc-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Auth Form */}
      <div
        className="flex-1 flex items-center justify-center p-6"
        style={{ background: "var(--color-background)" }}
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
              style={{
                background:
                  "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
              }}
            >
              J
            </div>
            <span
              className="font-bold text-xl"
              style={{ color: "var(--color-foreground)" }}
            >
              JobOS
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
