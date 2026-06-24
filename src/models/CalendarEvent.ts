import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICalendarEventDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  type: "interview" | "deadline" | "study" | "other";
  date: Date;
  time: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema = new Schema<ICalendarEventDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["interview", "deadline", "study", "other"], default: "other" },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String },
  },
  { timestamps: true }
);

const CalendarEvent: Model<ICalendarEventDocument> =
  mongoose.models.CalendarEvent || mongoose.model<ICalendarEventDocument>("CalendarEvent", CalendarEventSchema);

export default CalendarEvent;
