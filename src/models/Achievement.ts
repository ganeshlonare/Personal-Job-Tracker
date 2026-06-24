import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAchievementDocument extends Document {
  userId: mongoose.Types.ObjectId;
  achievementId: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  unlockedAt?: Date;
  progress: number;
  target: number;
  unlocked: boolean;
}

const AchievementSchema = new Schema<IAchievementDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    achievementId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    category: { type: String, required: true },
    unlockedAt: { type: Date },
    progress: { type: Number, default: 0 },
    target: { type: Number, required: true },
    unlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

const Achievement: Model<IAchievementDocument> =
  mongoose.models.Achievement ||
  mongoose.model<IAchievementDocument>("Achievement", AchievementSchema);

export default Achievement;
