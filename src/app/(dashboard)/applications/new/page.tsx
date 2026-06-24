"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { createApplication } from "@/actions/application.actions";
import { APPLICATION_STATUSES, PRIORITIES, PLATFORMS, REMOTE_OPTIONS } from "@/lib/constants";
import { PageHeader } from "@/components/shared/PageHeader";

const applicationSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  location: z.string().optional(),
  remote: z.enum(["remote", "hybrid", "onsite"]).optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  platform: z.string().optional(),
  appliedDate: z.string().optional(),
  deadline: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  jobLink: z.string().url("Invalid URL").optional().or(z.literal("")),
  careerPage: z.string().url("Invalid URL").optional().or(z.literal("")),
  recruiterName: z.string().optional(),
  recruiterEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  recruiterLinkedIn: z.string().optional(),
  coverLetter: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const inputClass = `w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all
  bg-[var(--color-card)] text-[var(--color-foreground)]
  border border-[var(--color-border)]
  focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20`;

const labelClass = "block text-xs font-medium mb-1.5 text-[var(--color-muted-foreground)]";

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
    >
      <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function NewApplicationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      status: "applied",
      priority: "medium",
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setIsLoading(true);
    try {
      const tags = data.tags
        ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      const result = await createApplication({
        ...data,
        tags,
        salaryMin: data.salaryMin || undefined,
        salaryMax: data.salaryMax || undefined,
        appliedDate: data.appliedDate ? new Date(data.appliedDate) : new Date(),
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Application added! +10 pts 🎯");
        router.push(`/applications/${result.id}`);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="New Application"
        description="Track a new job application"
        actions={
          <Link
            href="/applications"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-[var(--color-secondary)]"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Basic Info */}
        <FormSection title="Basic Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="app-company" className={labelClass}>
                Company <span className="text-red-500">*</span>
              </label>
              <input
                id="app-company"
                {...register("company")}
                className={inputClass}
                placeholder="Google, Amazon..."
              />
              {errors.company && (
                <p className="text-xs text-red-500 mt-1">{errors.company.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="app-role" className={labelClass}>
                Role / Position <span className="text-red-500">*</span>
              </label>
              <input
                id="app-role"
                {...register("role")}
                className={inputClass}
                placeholder="Software Engineer, SDE-1..."
              />
              {errors.role && (
                <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="app-location" className={labelClass}>Location</label>
              <input
                id="app-location"
                {...register("location")}
                className={inputClass}
                placeholder="Bangalore, Remote..."
              />
            </div>

            <div>
              <label htmlFor="app-remote" className={labelClass}>Work Type</label>
              <select id="app-remote" {...register("remote")} className={inputClass}>
                <option value="">Select type</option>
                {REMOTE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="app-salary-min" className={labelClass}>Min Salary (₹)</label>
              <input
                id="app-salary-min"
                type="number"
                {...register("salaryMin", { valueAsNumber: true })}
                className={inputClass}
                placeholder="500000"
              />
            </div>

            <div>
              <label htmlFor="app-salary-max" className={labelClass}>Max Salary (₹)</label>
              <input
                id="app-salary-max"
                type="number"
                {...register("salaryMax", { valueAsNumber: true })}
                className={inputClass}
                placeholder="800000"
              />
            </div>
          </div>
        </FormSection>

        {/* Status & Priority */}
        <FormSection title="Status & Priority">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="app-status" className={labelClass}>Status</label>
              <select id="app-status" {...register("status")} className={inputClass}>
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="app-priority" className={labelClass}>Priority</label>
              <select id="app-priority" {...register("priority")} className={inputClass}>
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="app-platform" className={labelClass}>Platform</label>
              <select id="app-platform" {...register("platform")} className={inputClass}>
                <option value="">Select platform</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="app-applied-date" className={labelClass}>Applied Date</label>
              <input
                id="app-applied-date"
                type="date"
                {...register("appliedDate")}
                className={inputClass}
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label htmlFor="app-deadline" className={labelClass}>Deadline</label>
              <input
                id="app-deadline"
                type="date"
                {...register("deadline")}
                className={inputClass}
              />
            </div>
          </div>
        </FormSection>

        {/* Links */}
        <FormSection title="Links">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="app-job-link" className={labelClass}>Job Link</label>
              <input
                id="app-job-link"
                {...register("jobLink")}
                className={inputClass}
                placeholder="https://linkedin.com/jobs/..."
              />
              {errors.jobLink && (
                <p className="text-xs text-red-500 mt-1">{errors.jobLink.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="app-career-page" className={labelClass}>Career Page</label>
              <input
                id="app-career-page"
                {...register("careerPage")}
                className={inputClass}
                placeholder="https://careers.company.com"
              />
            </div>
          </div>
        </FormSection>

        {/* Recruiter */}
        <FormSection title="Recruiter Information">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="app-recruiter-name" className={labelClass}>Recruiter Name</label>
              <input
                id="app-recruiter-name"
                {...register("recruiterName")}
                className={inputClass}
                placeholder="Jane Smith"
              />
            </div>

            <div>
              <label htmlFor="app-recruiter-email" className={labelClass}>Recruiter Email</label>
              <input
                id="app-recruiter-email"
                {...register("recruiterEmail")}
                className={inputClass}
                placeholder="recruiter@company.com"
              />
            </div>

            <div>
              <label htmlFor="app-recruiter-linkedin" className={labelClass}>Recruiter LinkedIn</label>
              <input
                id="app-recruiter-linkedin"
                {...register("recruiterLinkedIn")}
                className={inputClass}
                placeholder="linkedin.com/in/..."
              />
            </div>
          </div>
        </FormSection>

        {/* Notes */}
        <FormSection title="Notes & Tags">
          <div className="space-y-4">
            <div>
              <label htmlFor="app-notes" className={labelClass}>Notes</label>
              <textarea
                id="app-notes"
                {...register("notes")}
                rows={3}
                className={inputClass}
                placeholder="Any notes about this application..."
              />
            </div>

            <div>
              <label htmlFor="app-tags" className={labelClass}>
                Tags <span className="font-normal">(comma-separated)</span>
              </label>
              <input
                id="app-tags"
                {...register("tags")}
                className={inputClass}
                placeholder="dream-company, remote, fintech"
              />
            </div>
          </div>
        </FormSection>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link
            href="/applications"
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-[var(--color-secondary)]"
            style={{ color: "var(--color-foreground)", border: "1px solid var(--color-border)" }}
          >
            Cancel
          </Link>
          <button
            id="new-app-submit"
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Application
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
