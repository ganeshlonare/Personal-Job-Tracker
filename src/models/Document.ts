import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDocumentDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  category: string;
  fileUrl?: string;
  fileKey?: string;
  fileSize?: number;
  mimeType?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocumentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["resume", "cover_letter", "offer_letter", "certificate", "transcript", "notes", "image", "other"],
      default: "other",
    },
    fileUrl: { type: String },
    fileKey: { type: String },
    fileSize: { type: Number },
    mimeType: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

const DocumentModel: Model<IDocumentDocument> =
  mongoose.models.Document ||
  mongoose.model<IDocumentDocument>("Document", DocumentSchema);

export default DocumentModel;
