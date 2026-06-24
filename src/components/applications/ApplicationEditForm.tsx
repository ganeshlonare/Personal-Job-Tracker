"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save, X } from "lucide-react";
import { updateApplication } from "@/actions/application.actions";
import { APPLICATION_STATUSES, PRIORITIES, PLATFORMS, REMOTE_OPTIONS } from "@/lib/constants";
import type { IApplication } from "@/types";
import { format } from "date-fns";

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

interface ApplicationEditFormProps {
  application: IApplication;
  onSuccess: (updatedApp: IApplication) => void;
  onCancel: () => void;
}

export function ApplicationEditForm({ application, onSuccess, onCancel }: ApplicationEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      company: application.company,
      role: application.role,
      location: application.location || "",
      remote: application.remote || undefined,
      salaryMin: application.salaryMin || undefined,
      salaryMax: application.salaryMax || undefined,
      platform: application.platform || "",
      appliedDate: application.appliedDate ? format(new Date(application.appliedDate as any), "yyyy-MM-dd") : "",
      deadline: application.deadline ? format(new Date(application.deadline as any), "yyyy-MM-dd") : "",
      status: application.status,
      priority: application.priority,
      jobLink: application.jobLink || "",
      careerPage: application.careerPage || "",
      recruiterName: application.recruiterName || "",
      recruiterEmail: application.recruiterEmail || "",
      recruiterLinkedIn: application.recruiterLinkedIn || "",
      coverLetter: application.coverLetter || "",
      notes: application.notes || "",
      tags: application.tags ? application.tags.join(", ") : "",
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setIsLoading(true);
    try {
      const tags = data.tags
        ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      const result = await updateApplication(application._id, {
        ...data,
        tags,
        salaryMin: data.salaryMin || undefined,
        salaryMax: data.salaryMax || undefined,
        appliedDate: data.appliedDate ? new Date(data.appliedDate) : undefined,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      });

      if (result.success) {
        toast.success("Application updated successfully!");
        onSuccess({
          ...application,
          ...data,
          status: data.status as IApplication["status"],
          priority: data.priority as IApplication["priority"],
          tags,
          salaryMin: data.salaryMin || undefined,
          salaryMax: data.salaryMax || undefined,
          appliedDate: data.appliedDate ? new Date(data.appliedDate) : undefined,
          deadline: data.deadline ? new Date(data.deadline) : undefined,
        });
      } else {
        toast.error("Failed to update application");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Basic Info */}
      <FormSection title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Company <span className="text-red-500">*</span></label>
            <input {...register("company")} className={inputClass} />
            {errors.company && <p className="text-xs text-red-500 mt-1">{errors.company.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Role / Position <span className="text-red-500">*</span></label>
            <input {...register("role")} className={inputClass} />
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input {...register("location")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Work Type</label>
            <select {...register("remote")} className={inputClass}>
              <option value="">Select type</option>
              {REMOTE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Min Salary (₹)</label>
            <input type="number" {...register("salaryMin", { valueAsNumber: true })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Max Salary (₹)</label>
            <input type="number" {...register("salaryMax", { valueAsNumber: true })} className={inputClass} />
          </div>
        </div>
      </FormSection>

      {/* Status & Priority */}
      <FormSection title="Status & Priority">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Status</label>
            <select {...register("status")} className={inputClass}>
              {APPLICATION_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Priority</label>
            <select {...register("priority")} className={inputClass}>
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Platform</label>
            <select {...register("platform")} className={inputClass}>
              <option value="">Select platform</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Applied Date</label>
            <input type="date" {...register("appliedDate")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Deadline</label>
            <input type="date" {...register("deadline")} className={inputClass} />
          </div>
        </div>
      </FormSection>

      {/* Recruiter */}
      <FormSection title="Recruiter Information">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Recruiter Name</label>
            <input {...register("recruiterName")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Recruiter Email</label>
            <input {...register("recruiterEmail")} className={inputClass} />
            {errors.recruiterEmail && <p className="text-xs text-red-500 mt-1">{errors.recruiterEmail.message}</p>}
          </div>
          <div>
            <label className={labelClass}>LinkedIn Profile</label>
            <input {...register("recruiterLinkedIn")} className={inputClass} />
          </div>
        </div>
      </FormSection>

      {/* Details */}
      <FormSection title="Additional Details">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Job Link</label>
              <input {...register("jobLink")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Career Page</label>
              <input {...register("careerPage")} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Tags (comma separated)</label>
            <input {...register("tags")} className={inputClass} placeholder="Next.js, React, Remote" />
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea {...register("notes")} className={inputClass} rows={3} />
          </div>
        </div>
      </FormSection>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2 pb-8">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors hover:bg-[var(--color-secondary)]"
          style={{ color: "var(--color-foreground)" }}
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white transition-all disabled:opacity-70"
          style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
