import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProject extends Document {
  name: string;
  description: string;
  team: Types.ObjectId;
  createdBy: Types.ObjectId;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: "", maxlength: 1000 },
    team: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String, default: "", maxlength: 5000 },
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
