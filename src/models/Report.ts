import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReportDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: "daily" | "weekly" | "monthly";
  date: Date;
  startDate: Date;
  endDate: Date;
  content: {
    completed: string[];
    notCompleted: string[];
    productivityScore: number;
    hoursStudied: number;
    applicationsSent: number;
    leetcodeSolved: number;
    projectWork: number;
    streak: number;
    suggestions: string[];
  };
  aiSummary?: string;
  createdAt: Date;
}

const ReportSchema = new Schema<IReportDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["daily", "weekly", "monthly"], required: true },
    date: { type: Date, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    content: {
      completed: [{ type: String }],
      notCompleted: [{ type: String }],
      productivityScore: { type: Number, default: 0 },
      hoursStudied: { type: Number, default: 0 },
      applicationsSent: { type: Number, default: 0 },
      leetcodeSolved: { type: Number, default: 0 },
      projectWork: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
      suggestions: [{ type: String }],
    },
    aiSummary: { type: String },
  },
  { timestamps: true }
);

ReportSchema.index({ userId: 1, type: 1, date: -1 });

const Report: Model<IReportDocument> =
  mongoose.models.Report ||
  mongoose.model<IReportDocument>("Report", ReportSchema);

export default Report;
