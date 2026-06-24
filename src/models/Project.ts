import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProjectDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  techStack: string[];
  progress: number;
  status: "planning" | "in_progress" | "completed" | "paused";
  githubLink?: string;
  demoLink?: string;
  deploymentUrl?: string;
  milestones: { title: string; completed: boolean; completedAt?: Date }[];
  tasks: { title: string; completed: boolean; completedAt?: Date }[];
  dailyLogs: { date: Date; hours: number; notes?: string }[];
  images: string[];
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProjectDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    techStack: [{ type: String }],
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ["planning", "in_progress", "completed", "paused"],
      default: "planning",
    },
    githubLink: { type: String },
    demoLink: { type: String },
    deploymentUrl: { type: String },
    milestones: [
      {
        title: { type: String },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
      },
    ],
    tasks: [
      {
        title: { type: String },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
      },
    ],
    dailyLogs: [
      {
        date: { type: Date },
        hours: { type: Number },
        notes: { type: String },
      },
    ],
    images: [{ type: String }],
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

const Project: Model<IProjectDocument> =
  mongoose.models.Project ||
  mongoose.model<IProjectDocument>("Project", ProjectSchema);

export default Project;
