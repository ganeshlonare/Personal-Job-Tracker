import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDailyTargetItem {
  _id?: string;
  title: string;
  category: string;
  points: number;
}

export interface IDailyTargetDocument extends Document {
  userId: mongoose.Types.ObjectId;
  targets: IDailyTargetItem[];
}

const DailyTargetSchema = new Schema<IDailyTargetDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true, unique: true },
    targets: [
      {
        title: { type: String, required: true },
        category: { type: String, default: "other" },
        points: { type: Number, default: 5 },
      }
    ],
  },
  { timestamps: true }
);

const DailyTarget: Model<IDailyTargetDocument> =
  mongoose.models.DailyTarget || mongoose.model<IDailyTargetDocument>("DailyTarget", DailyTargetSchema);

export default DailyTarget;
