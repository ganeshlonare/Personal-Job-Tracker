import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInterviewDocument extends Document {
  userId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  date: Date;
  round: string;
  questionsAsked: string[];
  behavioralQuestions: string[];
  codingQuestions: string[];
  mistakes?: string;
  topicsToRevise: string[];
  interviewerFeedback?: string;
  personalRating?: number;
  result: "passed" | "failed" | "pending" | "cancelled";
  applicationId?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema = new Schema<IInterviewDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    date: { type: Date, required: true },
    round: { type: String, required: true },
    questionsAsked: [{ type: String }],
    behavioralQuestions: [{ type: String }],
    codingQuestions: [{ type: String }],
    mistakes: { type: String },
    topicsToRevise: [{ type: String }],
    interviewerFeedback: { type: String },
    personalRating: { type: Number, min: 1, max: 5 },
    result: {
      type: String,
      enum: ["passed", "failed", "pending", "cancelled"],
      default: "pending",
    },
    applicationId: { type: Schema.Types.ObjectId, ref: "Application" },
    notes: { type: String },
  },
  { timestamps: true }
);

InterviewSchema.index({ userId: 1, date: -1 });

const Interview: Model<IInterviewDocument> =
  mongoose.models.Interview ||
  mongoose.model<IInterviewDocument>("Interview", InterviewSchema);

export default Interview;
