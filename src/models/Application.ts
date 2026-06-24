import mongoose, { Schema, Document, Model } from "mongoose";

export interface IApplicationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  company: string;
  companyLogo?: string;
  role: string;
  location?: string;
  remote?: "remote" | "hybrid" | "onsite";
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  platform?: string;
  appliedDate?: Date;
  deadline?: Date;
  resumeVersion?: mongoose.Types.ObjectId;
  coverLetter?: string;
  recruiterName?: string;
  recruiterLinkedIn?: string;
  recruiterEmail?: string;
  jobLink?: string;
  careerPage?: string;
  status: string;
  priority: string;
  notes?: string;
  expectedResponseDate?: Date;
  referral?: { name: string; contact: string; relationship: string };
  tags: string[];
  customLabels: { key: string; value: string }[];
  timeline: { status: string; date: Date; note?: string }[];
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplicationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    company: { type: String, required: true },
    companyLogo: { type: String },
    role: { type: String, required: true },
    location: { type: String },
    remote: { type: String, enum: ["remote", "hybrid", "onsite"] },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    currency: { type: String, default: "INR" },
    platform: { type: String },
    appliedDate: { type: Date },
    deadline: { type: Date },
    resumeVersion: { type: Schema.Types.ObjectId, ref: "Resume" },
    coverLetter: { type: String },
    recruiterName: { type: String },
    recruiterLinkedIn: { type: String },
    recruiterEmail: { type: String },
    jobLink: { type: String },
    careerPage: { type: String },
    status: {
      type: String,
      enum: [
        "wishlist", "planning", "applied", "assessment_received",
        "assessment_completed", "interview_scheduled", "technical_round",
        "manager_round", "hr_round", "final_round", "offer",
        "accepted", "rejected", "ghosted", "withdrawn",
      ],
      default: "wishlist",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    notes: { type: String },
    expectedResponseDate: { type: Date },
    referral: {
      name: { type: String },
      contact: { type: String },
      relationship: { type: String },
    },
    tags: [{ type: String }],
    customLabels: [{ key: String, value: String }],
    timeline: [
      {
        status: { type: String },
        date: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ApplicationSchema.index({ userId: 1, status: 1 });
ApplicationSchema.index({ userId: 1, appliedDate: -1 });
ApplicationSchema.index({ userId: 1, company: 1 });

const Application: Model<IApplicationDocument> =
  mongoose.models.Application ||
  mongoose.model<IApplicationDocument>("Application", ApplicationSchema);

export default Application;
