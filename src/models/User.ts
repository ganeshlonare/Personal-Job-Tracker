import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  avatar?: string;
  targetCompany?: string;
  dreamCompany?: string;
  targetSalary?: number;
  preferredTechStack: string[];
  leetcodeUsername?: string;
  githubUsername?: string;
  dailyGoal: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: Date;
  lifetimeScore: number;
  theme: "light" | "dark" | "system";
  notificationSettings: {
    email: boolean;
    browser: boolean;
    dailyReport: boolean;
    weeklyReport: boolean;
  };
  onboarding: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String },
    avatar: { type: String },
    targetCompany: { type: String },
    dreamCompany: { type: String },
    targetSalary: { type: Number },
    preferredTechStack: [{ type: String }],
    leetcodeUsername: { type: String },
    githubUsername: { type: String },
    dailyGoal: { type: Number, default: 100 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    lifetimeScore: { type: Number, default: 0 },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    notificationSettings: {
      email: { type: Boolean, default: true },
      browser: { type: Boolean, default: true },
      dailyReport: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: true },
    },
    onboarding: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
