import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJournalDocument extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  entry: string;
  wins: string[];
  challenges: string[];
  gratitude: string[];
  mood: string;
  createdAt: Date;
  updatedAt: Date;
}

const JournalSchema = new Schema<IJournalDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    entry: { type: String, default: "" },
    wins: [{ type: String }],
    challenges: [{ type: String }],
    gratitude: [{ type: String }],
    mood: { type: String, default: "good" },
  },
  { timestamps: true }
);

JournalSchema.index({ userId: 1, date: -1 });

const Journal: Model<IJournalDocument> =
  mongoose.models.Journal ||
  mongoose.model<IJournalDocument>("Journal", JournalSchema);

export default Journal;
