import bcrypt from "bcrypt";
import { User } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
import { generateToken } from "../../utils/token.js";
import { sendEmail } from "../../utils/email.js";
import { status } from "../../utils/constant/enums.js";

// 1- Sign Up
export const signup = async (req, res, next) => {
  let { firstName, lastName, username, email, password, mobileNumber, DOB } = req.body;

  const userExists = await User.findOne({ $or: [{ email }, { mobileNumber }] });
  if (userExists) {
    return next(new AppError(messages.user.alreadyExist, 409));
  }

  password = bcrypt.hashSync(password, 8);
  const newUser = new User({
    firstName,
    lastName,
    username,
    email,
    password,
    mobileNumber,
    DOB,
  });

  const createdUser = await newUser.save();
  if (!createdUser) {
    return next(new AppError(messages.user.failToCreate));
  }
  // genreate token
  // const token = generateToken({ payload: { email , _id:createdUser._id} })
  // send email
  // await sendEmail({
  //   to:email,
  //   subject:"verify your account",
  //   html: `<p>Click on the link to verify your account: <a href="${req.protocol}://${req.headers.host}/auth/verify/${token}">Verify Account</a></p>`
  // })

  return res.status(201).json({
    message: messages.user.createSuccessfully,
    success: true,
    data: createdUser,
  });
};

// verify account

// export const verifyAccount = async (req, res, next) => {
// get data from req
//   const { token } = req.params;
// check token
//   const payload = verifyToken({token})
//   await User.findOneAndUpdate({ email: payload.email, status: status.ONLINE }, { status: status.VERIFIED },{status: status.OFFLINE},{status: status.PENDING})
// send res
//   return res.status(200).json({ message: messages.user.verified, success: true })
// }


// 2- Login
export const login = async (req, res, next) => {
  const { email, mobileNumber, password } = req.body;

  const userExist = await User.findOne({ $or: [{ email }, { mobileNumber }],status: status.OFFLINE });
  if (!userExist) {
    return next(new AppError(messages.userExist.invalidCredntiols, 400));
  }

  const isMatch = bcrypt.compareSync(password, userExist.password);
  if (!isMatch) {
    return next(new AppError(messages.userExist.invalidCredntiols, 401));
  }
  // genrate token
  const token = generateToken({ payload: { _id: userExist._id, email: userExist.email } });

  return res.status(200).json({
    message: messages.user.loginSuccessfully,
    success: true,
    token,
  });
};

// 3- Update Account
export const updateAccount = async (req, res, next) => {
  // get data from req
  const { userId } = req.params;
  const updates = req.body;
  
  // check if user exists
  const userExists = await User.findById(userId);
  if (!userExists) {
    return next(new AppError(messages.user.notFound, 404));
  }
  
  // Ensure only the owner can update their account
  if (userId !== req.user._id.toString()) {
    return next(new AppError(messages.user.notAuthorized, 403));
  }

  // Check for conflicting email or mobile number
  if (updates.email || updates.mobileNumber) {
    const conflictUser = await User.findOne({
      $or: [
        { email: updates.email },
        { mobileNumber: updates.mobileNumber }
      ],
      _id: { $ne: userId }
    });

    if (conflictUser) {
      return next(new AppError("Email or mobile number already exists.", 409));
    }
  }

  // Update user account
  const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
  if (!updatedUser) {
    return next(new AppError(messages.user.failToUpdate));
  }

  // Send response with updated user data
  return res.status(200).json({
    message: messages.user.updateSuccessfully,
    success: true,
    data: updatedUser,
  });
};

// 4- Delete Account
export const deleteAccount = async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError(messages.user.notFound, 404));
  }

  // Ensure only the owner can delete their account
  if (userId !== req.user._id.toString()) {
    return next(new AppError(messages.user.notAuthorized, 403));
  }

  await User.findByIdAndDelete(userId);

  return res.status(200).json({
    message: messages.user.deleteSuccessfully,
    success: true,
  });
};

// 5- Get User Account Data
export const getUserAccountData = async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError(messages.user.notFound, 404));
  }

  // Ensure only the owner can retrieve their account data
  if (userId !== req.user._id.toString()) {
    return next(new AppError(messages.user.notAuthorized, 403));
  }

  return res.status(200).json({
    success: true,
    data: user,
  });
};

// 6- Get Profile Data for Another User
export const getProfileData = async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError(messages.user.notFound, 404));
  }

  return res.status(200).json({
    success: true,
    data: user,
  });
};

// 7- Update Password
export const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Fetch the logged-in user
  const user = await User.findById(req.user._id);

  // Check if user exists
  if (!user) {
    return next(new AppError(messages.user.notFound, 404));
  }

  // Check if the current password is correct
  const isMatch = bcrypt.compareSync(currentPassword, user.password);
  if (!isMatch) {
    return next(new AppError(messages.user.invalidCredntiols, 400));
  }

  // Hash and update the new password
  const hashedPassword = bcrypt.hashSync(newPassword, 8);
  user.password = hashedPassword;
  await user.save();

  // Send response
  res.status(200).json({
    message: messages.user.updateSuccessfully,
    success: true,
  });
};

// 8- Forget password
// Step 1: Send OTP for Password Reset
export const sendResetPasswordOTP = async (req, res, next) => {
  const { email } = req.body;

  // Check if the user exists
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError(messages.user.notFound, 404));
  }

  // Generate OTP (One-Time Password)
  const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
  await user.save();

  // Send OTP via email
  await sendEmail({
    to: email,
    subject: "Password Reset OTP",
    html: `<p>Your OTP for password reset is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
  });

  res.status(200).json({
    message: "OTP sent to your email address",
    success: true,
  });
};

// Step 2: Verify OTP and Reset Password
export const resetPasswordWithOTP = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  // Check if the user exists
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError(messages.user.notFound, 404));
  }

  // Check if OTP matches and has not expired
  if (user.otp !== otp || user.otpExpires < Date.now()) {
    return next(new AppError("Invalid or expired OTP", 400));
  }

  // Hash and update the new password
  const hashedPassword = bcrypt.hashSync(newPassword, 8);
  user.password = hashedPassword;

  // Clear OTP fields
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save();

  res.status(200).json({
    message: messages.user.updateSuccessfully,
    success: true,
  });
};

// 9-  Get all accounts associated with a specific recovery email
export const getAccountsByRecoveryEmail = async (req, res, next) => {
  const { recoveryEmail } = req.body;

  // Check if recoveryEmail is provided
  if (!recoveryEmail) {
    return next(new AppError("Recovery email is required", 400));
  }

  // Find users with the given recovery email
  const users = await User.find({ recoveryEmail: recoveryEmail.toLowerCase() });

  // If no users are found, return an error
  if (!users.length) {
    return next(new AppError(messages.user.notFound, 404));
  }

  // Respond with the list of users
  res.status(200).json({
    message: "Accounts associated with the recovery email found successfully",
    success: true,
    data: users,
  });
};