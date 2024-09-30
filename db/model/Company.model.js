import { model, Schema } from "mongoose";

// Schema
const companySchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    numberOfEmployees: {
      type: String,
      enum: ["1-10", "11-20", "21-50", "51-100", "101-500", "500+"],
      required: true,
    },
    companyEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    companyHR: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // updatedBy: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'User',
      // required: true
  // }
  },
  { timestamps: true }
);

// Model
export const Company = model("Company", companySchema);
