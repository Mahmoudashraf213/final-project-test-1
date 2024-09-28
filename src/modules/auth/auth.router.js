import { Router } from "express";
import { isValid } from "../../middleware/vaildation.js";
import { asyncHandler } from "../../utils/appError.js";
import {
  signupValidation,
  loginValidation,
  updateAccountValidation,
  updatePasswordValidation,
  sendResetPasswordOTPValidation,
  resetPasswordWithOTPValidation,
  getAccountsByRecoveryEmailValidation,
} from "./auth.vaildation.js";
import {
  signup,
  login,
  updateAccount,
  deleteAccount,
  getUserAccountData,
  getProfileData,
  updatePassword,
  sendResetPasswordOTP,
  resetPasswordWithOTP,
  getAccountsByRecoveryEmail,
} from "./auth.controller.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enums.js";

const authRouter = Router();

// 1- Signup
authRouter.post('/signup', isValid(signupValidation), asyncHandler(signup));
// authRouter.get('/verify/:token',asyncHandler(verifyAccount))


// 2- Login
authRouter.post('/login', isValid(loginValidation), asyncHandler(login));

// 3- Update account
authRouter.put('/update/:userId',
  isAuthenticated(),
  isAuthorized([roles.USER]),
  isValid(updateAccountValidation), 
  asyncHandler(updateAccount));

// 4- Delete account
authRouter.delete('/delete/:userId', 
  isAuthenticated(),
  isAuthorized([roles.USER]),
  asyncHandler(deleteAccount));

// 5- Get user account data (self)
authRouter.get('/account/:userId', 
  isAuthenticated(),
  isAuthorized([roles.USER]),
  asyncHandler(getUserAccountData));

// 6- Get profile data (another user)
authRouter.get('/profile/:userId', asyncHandler(getProfileData));

// 7- Update password
authRouter.put('/password', 
  // isAuthenticated(),
  // isAuthorized([roles.USER]),
  isValid(updatePasswordValidation), 
  asyncHandler(updatePassword));

// 8- step(1) Forget password - Send OTP
authRouter.post('/forget-password', isValid(sendResetPasswordOTPValidation), asyncHandler(sendResetPasswordOTP));

// 8- step(2) Reset password with OTP
authRouter.post('/reset-password', isValid(resetPasswordWithOTPValidation), asyncHandler(resetPasswordWithOTP));

// 9- Get accounts by recovery email
authRouter.post('/accounts-by-recovery-email', isValid(getAccountsByRecoveryEmailValidation), asyncHandler(getAccountsByRecoveryEmail));

export default authRouter;
