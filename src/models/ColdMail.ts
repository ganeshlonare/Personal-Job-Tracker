import mongoose, { Schema, Document, Model } from "mongoose";

export interface IColdMailDocument extends Document {
  userId: mongoose.Types.ObjectId;
  recipientName: string;
  recipientEmail?: string;
  company?: string;
  subject?: string;
  status: "sent" | "replied" | "bounced" | "ignored";
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ColdMailSchema = new Schema<IColdMailDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recipientName: { type: String, required: true },
    recipientEmail: { type: String },
    company: { type: String },
    subject: { type: String },
    status: { type: String, enum: ["sent", "replied", "bounced", "ignored"], default: "sent" },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

const ColdMail: Model<IColdMailDocument> =
  mongoose.models.ColdMail || mongoose.model<IColdMailDocument>("ColdMail", ColdMailSchema);

export default ColdMail;
