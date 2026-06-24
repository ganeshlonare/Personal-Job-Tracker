import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICompanyDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  logo?: string;
  industry?: string;
  website?: string;
  careerPage?: string;
  hiringFrequency?: "always" | "seasonal" | "rare";
  lastApplied?: Date;
  applicationCount: number;
  contacts: {
    name: string;
    role: string;
    email?: string;
    linkedin?: string;
    notes?: string;
  }[];
  notes?: string;
  priority: string;
  favorite: boolean;
  responseHistory: {
    applicationId: mongoose.Types.ObjectId;
    status: string;
    responseTime: number;
    date: Date;
  }[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompanyDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    logo: { type: String },
    industry: { type: String },
    website: { type: String },
    careerPage: { type: String },
    hiringFrequency: { type: String, enum: ["always", "seasonal", "rare"] },
    lastApplied: { type: Date },
    applicationCount: { type: Number, default: 0 },
    contacts: [
      {
        name: { type: String },
        role: { type: String },
        email: { type: String },
        linkedin: { type: String },
        notes: { type: String },
      },
    ],
    notes: { type: String },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    favorite: { type: Boolean, default: false },
    responseHistory: [
      {
        applicationId: { type: Schema.Types.ObjectId, ref: "Application" },
        status: { type: String },
        responseTime: { type: Number },
        date: { type: Date },
      },
    ],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

const Company: Model<ICompanyDocument> =
  mongoose.models.Company ||
  mongoose.model<ICompanyDocument>("Company", CompanySchema);

export default Company;
