import joi from "joi";
import { generalFields } from "../../middleware/vaildation.js";

// 1- Validation for Signup
export const signupValidation = joi.object({
  firstName: generalFields.firstName,
  lastName: generalFields.lastName,
  username: generalFields.username,
  email: generalFields.email,
  password: generalFields.password,
  mobileNumber: generalFields.mobileNumber,
  DOB: generalFields.DOB,
  recoveryEmail: generalFields.recoveryEmail.optional(),
  role: generalFields.role,
});

// 2- Validation for Login
export const loginValidation = joi.object({
  email: generalFields.email.optional(),
  mobileNumber: generalFields.mobileNumber.optional(),
  password: generalFields.password.required(),
}).or("email", "mobileNumber"); 

// 3- Validation for Update Account
export const updateAccountVal = joi.object({
  userId: generalFields.objectId.required(),
  firstName: generalFields.firstName.optional(),
  lastName: generalFields.lastName.optional(),
  // username: generalFields.username.optional(),
  email: generalFields.email.optional(),
  mobileNumber: generalFields.mobileNumber.optional(),
  recoveryEmail: generalFields.recoveryEmail.optional(),
  DOB: generalFields.DOB.optional(),
  // role: generalFields.role.optional(),
});

// 3-  Validation for Update Password
export const updatePasswordValidation = joi.object({
  currentPassword: generalFields.password.required(),
  newPassword: generalFields.password.required(),
});

// 4-  Validation for Forget Password (Step 1: Sending OTP)
export const sendResetPasswordOTPVal = joi.object({
  email: generalFields.email.required(),
});

// 4-  Validation for Reset Password with OTP (Step 2)
export const resetPasswordWithOTPVal = joi.object({
  email: generalFields.email.required(),
  otp: joi.string().length(6).required(), // 6-digit OTP
  newPassword: generalFields.password.required(),
});

// 5-  Validation for Get All Accounts by Recovery Email
export const getAccountsByRecoveryEmailVal = joi.object({
  recoveryEmail: generalFields.recoveryEmail.required(),
});
