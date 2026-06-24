import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITaskDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category: string;
  priority: string;
  timeEstimate?: number;
  timeSpent: number;
  completed: boolean;
  completedAt?: Date;
  date: Date;
  points: number;
  isDailyTarget?: boolean;
  dailyTargetId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITaskDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ["leetcode", "application", "study", "project", "interview", "networking", "cold-mail", "todo", "other"],
      default: "other",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    timeEstimate: { type: Number },
    timeSpent: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    date: { type: Date, required: true, index: true },
    points: { type: Number, default: 5 },
    isDailyTarget: { type: Boolean, default: false },
    dailyTargetId: { type: String },
  },
  { timestamps: true }
);

TaskSchema.index({ userId: 1, date: 1 });

// Ensure model is re-registered during hot-reload/dev so schema updates (enum additions)
// are applied without requiring a full process restart.
if (mongoose.models && mongoose.models.Task) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  delete mongoose.models.Task;
}

const Task: Model<ITaskDocument> = mongoose.model<ITaskDocument>("Task", TaskSchema);

export default Task;
