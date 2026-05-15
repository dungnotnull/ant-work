import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWorkLog extends Document {
  task: Types.ObjectId;
  user: Types.ObjectId;
  project: Types.ObjectId;
  hours: number;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WorkLogSchema = new Schema<IWorkLog>(
  {
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    hours: { type: Number, required: true, min: 0.25, max: 24 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    date: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

WorkLogSchema.index({ user: 1, date: -1 });
WorkLogSchema.index({ project: 1, date: -1 });

export default mongoose.models.WorkLog || mongoose.model<IWorkLog>("WorkLog", WorkLogSchema);
