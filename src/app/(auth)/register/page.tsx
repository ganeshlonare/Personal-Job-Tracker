"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/validators/auth.schema";
import { registerUser } from "@/actions/auth.actions";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      // Auto-login after register
      const loginResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (loginResult?.error) {
        toast.success("Account created! Please sign in.");
        router.push("/login");
      } else {
        toast.success("Welcome to JobOS! Let's crush it 🚀");
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
          Create your account
        </h1>
        <p style={{ color: "var(--color-muted-foreground)" }} className="text-sm">
          Start your job search OS — free forever
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="register-name"
            className="block text-sm font-medium mb-1.5"
            style={{ color: "var(--color-foreground)" }}
          >
            Full name
          </label>
          <input
            id="register-name"
            type="text"
            placeholder="John Doe"
            className={inputClass}
            {...register("name")}
            autoComplete="name"
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="register-email"
            className="block text-sm font-medium mb-1.5"
            style={{ color: "var(--color-foreground)" }}
          >
            Email address
          </label>
          <input
            id="register-email"
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
            htmlFor="register-password"
            className="block text-sm font-medium mb-1.5"
            style={{ color: "var(--color-foreground)" }}
          >
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              placeholder="Min 6 characters"
              className={`${inputClass} pr-11`}
              {...register("password")}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md"
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

        <div>
          <label
            htmlFor="register-confirm"
            className="block text-sm font-medium mb-1.5"
            style={{ color: "var(--color-foreground)" }}
          >
            Confirm password
          </label>
          <input
            id="register-confirm"
            type="password"
            placeholder="Re-enter password"
            className={inputClass}
            {...register("confirmPassword")}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          id="register-submit"
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-60 mt-2"
          style={{
            background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
          }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <p
        className="mt-4 text-xs text-center"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        By creating an account, you agree to our{" "}
        <span style={{ color: "var(--color-primary)" }} className="cursor-pointer">
          Terms of Service
        </span>
      </p>

      <div
        className="mt-6 pt-6 text-center text-sm"
        style={{
          borderTop: "1px solid var(--color-border)",
          color: "var(--color-muted-foreground)",
        }}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium"
          style={{ color: "var(--color-primary)" }}
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
