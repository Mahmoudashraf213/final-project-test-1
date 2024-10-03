import { model, Schema } from "mongoose";

const applicationSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userTechSkills: {
      type: [String],
      required: true,
    },
    userSoftSkills: {
      type: [String],
      required: true,
    },
    userResume: {
      secure_url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true }
);

// Model
export const Application = model("Application", applicationSchema);
