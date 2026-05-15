import mongoose, { Schema, Document, Types } from "mongoose";
import { TASK_STATUSES, PRIORITIES, type TaskStatus, type Priority } from "@/lib/constants";

export interface ITask extends Document {
  title: string;
  description: string;
  story: Types.ObjectId;
  project: Types.ObjectId;
  status: TaskStatus;
  priority: Priority;
  storyPoints: number;
  assignees: Types.ObjectId[];
  dueDate: Date | null;
  startDate: Date | null;
  estimateHours: number;
  reviewer: Types.ObjectId | null;
  notes: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: "", maxlength: 2000 },
    story: { type: Schema.Types.ObjectId, ref: "Story", required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    status: { type: String, enum: TASK_STATUSES, default: "To Do", index: true },
    priority: { type: String, enum: PRIORITIES, default: "Medium" },
    storyPoints: { type: Number, default: 0, min: 0 },
    assignees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    dueDate: { type: Date, default: null },
    startDate: { type: Date, default: null },
    estimateHours: { type: Number, default: 0, min: 0 },
    reviewer: { type: Schema.Types.ObjectId, ref: "User", default: null },
    notes: { type: String, default: "", maxlength: 5000 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
