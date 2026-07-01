import mongoose, { Schema, Document, Model } from "mongoose";

export interface IIssue extends Document {
  title: string;
  description: string;
  status: "open" | "closed";
  repository: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const IssueSchema = new Schema<IIssue>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Issue: Model<IIssue> = mongoose.model<IIssue>("Issue", IssueSchema);

export default Issue;
