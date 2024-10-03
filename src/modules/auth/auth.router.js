import { Router } from "express";
import { isValid } from "../../middleware/vaildation.js";
import { asyncHandler } from "../../utils/appError.js";
import {
  signupValidation,
  loginValidation,
  updateAccountVal,
  updatePasswordValidation,
  sendResetPasswordOTPVal,
  resetPasswordWithOTPVal,
  getAccountsByRecoveryEmailVal,
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

/**
 * @route POST /auth/signup
 * @desc Register a new user account.
 * @param {string} firstName - User's first name.
 * @param {string} lastName - User's last name.
 * @param {string} username - User's desired username.
 * @param {string} email - User's email address.
 * @param {string} recoveryEmail - User's recovery email address.
 * @param {string} password - User's desired password.
 * @param {string} mobileNumber - User's mobile phone number.
 * @param {string} role - User's role (e.g., admin, user).
 * @param {string} DOB - User's date of birth.
 * @returns {Object} 201 - Successfully created user object with message and success status.
 * @returns {Object} 409 - Conflict error if the user already exists.
 * @returns {Object} 500 - Internal server error if the creation fails.
 */
// 1- Signup
authRouter.post('/signup', isValid(signupValidation), asyncHandler(signup));
// authRouter.get('/verify/:token',asyncHandler(verifyAccount))

/**
 * @route POST /auth/login
 * @desc Authenticate a user and log them into their account.
 * @param {string} email - User's email address for login.
 * @param {string} mobileNumber - User's mobile phone number for login.
 * @param {string} password - User's password.
 * @returns {Object} 200 - Successfully logged in user object with message, success status, and token.
 * @returns {Object} 400 - Bad request error if user credentials are invalid.
 * @returns {Object} 401 - Unauthorized error if password does not match.
 */
// 2- Login
authRouter.post('/login', isValid(loginValidation), asyncHandler(login));

/**
 * @route PUT /auth/update/:userId
 * @desc Update a user's account information.
 * @param {string} userId - The ID of the user to update.
 * @param {Object} req.body - The data to update the user's account.
 * @param {string} req.body.firstName - User's updated first name.
 * @param {string} req.body.lastName - User's updated last name.
 * @param {string} req.body.email - User's updated email address.
 * @param {string} req.body.mobileNumber - User's updated mobile number.
 * @param {string} req.body.recoveryEmail - User's updated recovery email.
 * @param {string} req.body.DOB - User's updated date of birth.
 * @returns {Object} 200 - Successfully updated user object with message and success status.
 * @returns {Object} 401 - Unauthorized error if user is not authorized to update the account.
 * @returns {Object} 404 - Not found error if user with specified ID does not exist.
 * @returns {Object} 400 - Bad request error if validation fails.
 */
// 3- Update account
authRouter.put('/update/:userId',
  isAuthenticated(),
  isAuthorized([roles.USER,roles.COMPANY_HR]),
  isValid(updateAccountVal),
  asyncHandler(updateAccount));

  /**
 * @route DELETE /auth/delete/:userId
 * @desc Delete a user's account from the system.
 * @param {string} userId - The ID of the user to be deleted.
 * @returns {Object} 200 - Success message indicating the account has been deleted.
 * @returns {Object} 401 - Unauthorized error if the user is not authenticated or authorized.
 * @returns {Object} 404 - Not found error if user with specified ID does not exist.
 */
// 4- Delete account
authRouter.delete('/delete/:userId',
  isAuthenticated(),
  isAuthorized([roles.USER]),
  asyncHandler(deleteAccount));

  /**
 * @route GET /auth/account/:userId
 * @desc Retrieve the account data of the authenticated user.
 * @param {string} userId - The ID of the user whose account data is being requested.
 * @returns {Object} 200 - The user's account data.
 * @returns {Object} 401 - Unauthorized error if the user is not authenticated or authorized.
 * @returns {Object} 404 - Not found error if no user with the specified ID exists.
 */
// 5- Get user account data (self)
authRouter.get('/account/:userId',
  isAuthenticated(),
  isAuthorized([roles.USER]),
  asyncHandler(getUserAccountData));

/**
 * @route GET /auth/profile/:userId
 * @desc Retrieve the profile data of another user.
 * @param {string} userId - The ID of the user whose profile data is being requested.
 * @returns {Object} 200 - The requested user's profile data.
 * @returns {Object} 404 - Not found error if no user with the specified ID exists.
 */  
// 6- Get profile data (another user)
authRouter.get('/profile/:userId', asyncHandler(getProfileData));

/**
 * @route PUT /auth/password
 * @desc Update the user's password.
 * @security BearerAuth
 * @param {object} req.body - The request body containing the new password.
 * @param {string} req.body.newPassword - The new password for the user.
 * @param {string} req.body.confirmPassword - Confirmation of the new password.
 * @returns {Object} 200 - A success message confirming the password has been updated.
 * @returns {Object} 400 - Bad request error if the password validation fails or the passwords do not match.
 * @returns {Object} 401 - Unauthorized error if the user is not authenticated or authorized.
 */
// 7- Update password
authRouter.put('/password',
  isAuthenticated(),
  isAuthorized([roles.USER]),
  isValid(updatePasswordValidation),
  asyncHandler(updatePassword));

  /**
 * @route POST /auth/forget-password
 * @desc Send a One-Time Password (OTP) to the user's email or mobile number for password reset.
 * @param {object} req.body - The request body containing user credentials for OTP generation.
 * @param {string} req.body.email - The email of the user requesting the password reset.
 * @param {string} req.body.mobileNumber - The mobile number of the user requesting the password reset.
 * @returns {Object} 200 - A success message indicating the OTP has been sent.
 * @returns {Object} 400 - Bad request error if validation fails or if the user is not found.
 * @returns {Object} 404 - Not found error if the user with the provided email or mobile number does not exist.
 */
// 8- step(1) Forget password - Send OTP
authRouter.post('/forget-password', 
  isValid(sendResetPasswordOTPVal), 
  asyncHandler(sendResetPasswordOTP));

  /**
 * @route POST /auth/reset-password
 * @desc Reset the user's password using a One-Time Password (OTP).
 * @param {object} req.body - The request body containing the user's credentials and new password.
 * @param {string} req.body.email - The email of the user resetting their password.
 * @param {string} req.body.otp - The OTP sent to the user for verification.
 * @param {string} req.body.newPassword - The new password the user wants to set.
 * @returns {Object} 200 - A success message indicating the password has been reset.
 * @returns {Object} 400 - Bad request error if validation fails or if the OTP is invalid.
 * @returns {Object} 404 - Not found error if the user with the provided email does not exist.
 * @returns {Object} 401 - Unauthorized error if the OTP verification fails.
 */
// 8- step(2) Reset password with OTP
authRouter.post('/reset-password', 
  isValid(resetPasswordWithOTPVal), 
  asyncHandler(resetPasswordWithOTP));

  /**
 * @route POST /auth/accounts-by-recovery-email
 * @desc Retrieve user accounts associated with a specified recovery email.
 * @param {object} req.body - The request body containing the recovery email.
 * @param {string} req.body.recoveryEmail - The recovery email used to find associated accounts.
 * @returns {Object} 200 - A success message with an array of accounts linked to the recovery email.
 * @returns {Object} 400 - Bad request error if validation fails or if no recovery email is provided.
 * @returns {Object} 404 - Not found error if no accounts are associated with the provided recovery email.
 */
// 9- Get accounts by recovery email
authRouter.post('/accounts-by-recovery-email', 
  isValid(getAccountsByRecoveryEmailVal), 
  asyncHandler(getAccountsByRecoveryEmail));

export default authRouter;
