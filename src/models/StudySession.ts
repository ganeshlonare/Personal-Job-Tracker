import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudySessionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  topic?: string;
  duration: number;
  pomodoroCount: number;
  notes?: string;
  date: Date;
  type: "study" | "revision" | "practice";
  createdAt: Date;
  updatedAt: Date;
}

const StudySessionSchema = new Schema<IStudySessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true },
    topic: { type: String },
    duration: { type: Number, required: true },
    pomodoroCount: { type: Number, default: 0 },
    notes: { type: String },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ["study", "revision", "practice"],
      default: "study",
    },
  },
  { timestamps: true }
);

StudySessionSchema.index({ userId: 1, date: -1 });

const StudySession: Model<IStudySessionDocument> =
  mongoose.models.StudySession ||
  mongoose.model<IStudySessionDocument>("StudySession", StudySessionSchema);

export default StudySession;
