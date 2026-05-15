import mongoose, { Schema, Document, Types } from "mongoose";
import { TASK_STATUSES, PRIORITIES, type TaskStatus, type Priority } from "@/lib/constants";

export interface IStory extends Document {
  title: string;
  description: string;
  epic: Types.ObjectId;
  project: Types.ObjectId;
  status: TaskStatus;
  priority: Priority;
  storyPoints: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StorySchema = new Schema<IStory>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: "", maxlength: 2000 },
    epic: { type: Schema.Types.ObjectId, ref: "Epic", required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    status: { type: String, enum: TASK_STATUSES, default: "To Do" },
    priority: { type: String, enum: PRIORITIES, default: "Medium" },
    storyPoints: { type: Number, default: 0, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Story || mongoose.model<IStory>("Story", StorySchema);
