import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRepo extends Document {
  name: string;
  description: string;
  content: string;
  visibility: boolean;
  owner: mongoose.Types.ObjectId;
  issues: mongoose.Types.ObjectId;
  stars: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const RepositorySchema = new Schema<IRepo>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    content: [
      {
        type: String,
      },
    ],
    visibility: {
      type: Boolean,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issues: [
      {
        type: Schema.Types.ObjectId,
        ref: "Issue",
      },
    ],
    stars: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Repository: Model<IRepo> = mongoose.model<IRepo>(
  "Repository",
  RepositorySchema,
);

export default Repository;
