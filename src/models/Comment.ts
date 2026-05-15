import mongoose, { Schema, Document, Types } from "mongoose";

export interface IComment extends Document {
  task: Types.ObjectId;
  user: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

CommentSchema.index({ task: 1, createdAt: -1 });

export default mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);
