import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "Admin" | "Team Lead" | "Member";
  team: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@dymvietnam\.net$/, "Email must be @dymvietnam.net"],
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["Admin", "Team Lead", "Member"],
      default: "Member",
    },
    team: { type: Schema.Types.ObjectId, ref: "Team" },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
