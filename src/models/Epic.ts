import mongoose, { Schema, Document, Types } from "mongoose";
import { TASK_STATUSES, PRIORITIES, type TaskStatus, type Priority } from "@/lib/constants";

export interface IEpic extends Document {
  title: string;
  description: string;
  project: Types.ObjectId;
  status: TaskStatus;
  priority: Priority;
  storyPoints: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EpicSchema = new Schema<IEpic>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: "", maxlength: 2000 },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    status: { type: String, enum: TASK_STATUSES, default: "To Do" },
    priority: { type: String, enum: PRIORITIES, default: "Medium" },
    storyPoints: { type: Number, default: 0, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Epic || mongoose.model<IEpic>("Epic", EpicSchema);
