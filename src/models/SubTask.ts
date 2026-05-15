import mongoose, { Schema, Document, Types } from "mongoose";
import { TASK_STATUSES, PRIORITIES, type TaskStatus, type Priority } from "@/lib/constants";

export interface ISubTask extends Document {
  title: string;
  description: string;
  task: Types.ObjectId;
  project: Types.ObjectId;
  status: TaskStatus;
  priority: Priority;
  storyPoints: number;
  assignee: Types.ObjectId | null;
  dueDate: Date | null;
  startDate: Date | null;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubTaskSchema = new Schema<ISubTask>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: "", maxlength: 2000 },
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    status: { type: String, enum: TASK_STATUSES, default: "To Do" },
    priority: { type: String, enum: PRIORITIES, default: "Medium" },
    storyPoints: { type: Number, default: 0, min: 0 },
    assignee: { type: Schema.Types.ObjectId, ref: "User", default: null },
    dueDate: { type: Date, default: null },
    startDate: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.SubTask || mongoose.model<ISubTask>("SubTask", SubTaskSchema);
