"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginSchema, type LoginInput } from "@/validators/auth.schema";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back! 🎉");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none
    bg-[var(--color-secondary)] text-[var(--color-foreground)]
    border border-[var(--color-border)]
    focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20
    placeholder:text-[var(--color-muted-foreground)]`;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--color-foreground)" }}
        >
          Welcome back
        </h1>
        <p style={{ color: "var(--color-muted-foreground)" }} className="text-sm">
          Sign in to continue your job search journey
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="login-email"
            className="block text-sm font-medium mb-1.5"
            style={{ color: "var(--color-foreground)" }}
          >
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            className={inputClass}
            {...register("email")}
            autoComplete="email"
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="block text-sm font-medium mb-1.5"
            style={{ color: "var(--color-foreground)" }}
          >
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`${inputClass} pr-11`}
              {...register("password")}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          id="login-submit"
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          style={{
            background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
          }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <div
        className="mt-6 pt-6 text-center text-sm"
        style={{
          borderTop: "1px solid var(--color-border)",
          color: "var(--color-muted-foreground)",
        }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium transition-colors"
          style={{ color: "var(--color-primary)" }}
        >
          Create one free
        </Link>
      </div>

      {/* Demo credentials hint */}
      <div
        className="mt-4 p-3 rounded-xl text-xs text-center"
        style={{
          background: "var(--color-muted)",
          color: "var(--color-muted-foreground)",
        }}
      >
        💡 Create an account to get started — no credit card required
      </div>
    </div>
  );
}
