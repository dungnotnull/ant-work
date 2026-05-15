import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITimeSession extends Document {
  task: Types.ObjectId;
  user: Types.ObjectId;
  status: "running" | "paused" | "stopped";
  startTime: Date;
  pauseTime: Date | null;
  totalPausedMs: number;
  endTime: Date | null;
  durationMs: number;
  createdAt: Date;
  updatedAt: Date;
}

const TimeSessionSchema = new Schema<ITimeSession>(
  {
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["running", "paused", "stopped"], default: "running" },
    startTime: { type: Date, required: true },
    pauseTime: { type: Date, default: null },
    totalPausedMs: { type: Number, default: 0 },
    endTime: { type: Date, default: null },
    durationMs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

TimeSessionSchema.index({ user: 1, status: 1 });

export default mongoose.models.TimeSession || mongoose.model<ITimeSession>("TimeSession", TimeSessionSchema);
