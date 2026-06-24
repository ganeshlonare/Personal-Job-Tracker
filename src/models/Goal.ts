import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGoalDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: Date;
  milestones: {
    title: string;
    value: number;
    reached: boolean;
    reachedAt?: Date;
  }[];
  dailyTarget: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoalDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, default: "general" },
    targetValue: { type: Number, required: true },
    currentValue: { type: Number, default: 0 },
    unit: { type: String, default: "" },
    deadline: { type: Date },
    milestones: [
      {
        title: { type: String },
        value: { type: Number },
        reached: { type: Boolean, default: false },
        reachedAt: { type: Date },
      },
    ],
    dailyTarget: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["active", "completed", "paused", "failed"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Goal: Model<IGoalDocument> =
  mongoose.models.Goal || mongoose.model<IGoalDocument>("Goal", GoalSchema);

export default Goal;
