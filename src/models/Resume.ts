import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResumeDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  version: string;
  fileUrl?: string;
  fileKey?: string;
  lastUpdated: Date;
  applicationCount: number;
  responseCount: number;
  interviewCount: number;
  active: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResumeDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    version: { type: String, default: "1.0" },
    fileUrl: { type: String },
    fileKey: { type: String },
    lastUpdated: { type: Date, default: Date.now },
    applicationCount: { type: Number, default: 0 },
    responseCount: { type: Number, default: 0 },
    interviewCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

const Resume: Model<IResumeDocument> =
  mongoose.models.Resume ||
  mongoose.model<IResumeDocument>("Resume", ResumeSchema);

export default Resume;
