import { model, Schema } from "mongoose";

const applicationSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job", // Reference to the Job model
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    userTechSkills: {
      type: [String], // Array of technical skills
      required: true,
    },
    userSoftSkills: {
      type: [String], // Array of soft skills
      required: true,
    },
    userResume: {
      type: String, // URL of the resume stored in Cloudinary
      required: true,
    },
  },
  { timestamps: true }
);

// Model
export const Application = model("Application", applicationSchema);
