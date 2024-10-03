import { model, Schema } from "mongoose";
import {
  jobLocations,
  workingTimes,
  seniorityLevels,
} from "../../src/utils/constant/enums.js";

const jobSchema = new Schema(
  {
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    jobLocation: {
      type: String,
      enum: Object.values(jobLocations),
      required: true,
    },
    workingTime: {
      type: String,
      enum: Object.values(workingTimes),
      required: true,
    },
    seniorityLevel: {
      type: String,
      enum: Object.values(seniorityLevels),
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
      trim: true,
    },
    technicalSkills: {
      type: [String],
      required: true,
    },
    softSkills: {
      type: [String],
      required: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    // company:{
    //   type: Schema.Types.ObjectId,
    //   ref: "Company",
    // },

  },
  { timestamps: true }
);

export const Job = model("Job", jobSchema);
