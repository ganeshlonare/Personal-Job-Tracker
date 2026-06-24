import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDailyScoreDocument extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  score: number;
  breakdown: {
    applications: number;
    leetcode: number;
    study: number;
    project: number;
    interview: number;
    networking: number;
    other: number;
  };
  tasksCompleted: number;
  totalTasks: number;
  createdAt: Date;
}

const DailyScoreSchema = new Schema<IDailyScoreDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    score: { type: Number, default: 0 },
    breakdown: {
      applications: { type: Number, default: 0 },
      leetcode: { type: Number, default: 0 },
      study: { type: Number, default: 0 },
      project: { type: Number, default: 0 },
      interview: { type: Number, default: 0 },
      networking: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    tasksCompleted: { type: Number, default: 0 },
    totalTasks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

DailyScoreSchema.index({ userId: 1, date: -1 }, { unique: true });

const DailyScore: Model<IDailyScoreDocument> =
  mongoose.models.DailyScore ||
  mongoose.model<IDailyScoreDocument>("DailyScore", DailyScoreSchema);

export default DailyScore;
