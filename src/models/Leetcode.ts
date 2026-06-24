import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILeetcodeDocument extends Document {
  userId: mongoose.Types.ObjectId;
  problemName: string;
  problemNumber?: number;
  difficulty: "easy" | "medium" | "hard";
  topic: string[];
  timeTaken?: number;
  mistakes?: string;
  revisionRequired: boolean;
  notes?: string;
  status: "attempted" | "solved" | "needs_revision";
  bookmarked: boolean;
  solvedDate: Date;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeetcodeSchema = new Schema<ILeetcodeDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    problemName: { type: String, required: true },
    problemNumber: { type: Number },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    topic: [{ type: String }],
    timeTaken: { type: Number },
    mistakes: { type: String },
    revisionRequired: { type: Boolean, default: false },
    notes: { type: String },
    status: {
      type: String,
      enum: ["attempted", "solved", "needs_revision"],
      default: "attempted",
    },
    bookmarked: { type: Boolean, default: false },
    solvedDate: { type: Date, default: Date.now },
    link: { type: String },
  },
  { timestamps: true }
);

LeetcodeSchema.index({ userId: 1, solvedDate: -1 });
LeetcodeSchema.index({ userId: 1, difficulty: 1 });

const Leetcode: Model<ILeetcodeDocument> =
  mongoose.models.Leetcode ||
  mongoose.model<ILeetcodeDocument>("Leetcode", LeetcodeSchema);

export default Leetcode;
