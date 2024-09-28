import { model, Schema } from "mongoose";
import { roles } from "../../src/utils/constant/enums.js";
// Schema
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      // required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    recoveryEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    DOB: {
      type: Date,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(roles), // Assuming roles contains 'User' and 'Company_HR'
      default: roles.USER,
    },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
  },
  { timestamps: true }
);
// Pre-save hook to generate the username
userSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('firstName') || this.isModified('lastName')) {
    this.username = `${this.firstName.toLowerCase()}_${this.lastName.toLowerCase()}`;
  }
  next();
});
// Model
export const User = model("User", userSchema);
