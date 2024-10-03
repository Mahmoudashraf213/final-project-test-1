import bcrypt from "bcrypt";
import crypto from "crypto";
import { Application, Company, Job, User } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
import { generateToken } from "../../utils/token.js";
import { sendEmail } from "../../utils/email.js";
import { status } from "../../utils/constant/enums.js";


// 1- Sign Up
export const signup = async (req, res, next) => {
  let { firstName, lastName, username, email,recoveryEmail, password, mobileNumber,role, DOB } =
    req.body;

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
    recoveryEmail,
    password,
    mobileNumber,
    role,
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

  const userExist = await User.findOneAndUpdate(
    { $or: [{ email }, { mobileNumber }] },
    { status: status.ONLINE },
    { nwe: true }
  );
  if (!userExist) {
    return next(new AppError(messages.userExist.invalidCredntiols, 400));
  }

  const isMatch = bcrypt.compareSync(password, userExist.password);
  if (!isMatch) {
    return next(new AppError(messages.userExist.invalidCredntiols, 401));
  }
  // genrate token
  const token = generateToken({
    payload: { _id: userExist._id, email: userExist.email },
  });

  return res.status(200).json({
    message: messages.user.loginSuccessfully,
    success: true,
    token,
  });
};

// 3- Update Account
export const updateAccount = async (req, res, next) => {
  try {
    // Get user ID from params and updates from the request body
    const { userId } = req.params;
    const { email, mobileNumber, recoveryEmail, DOB, lastName, firstName } =req.body;
    const authUserId = req.authUser._id;
    // console.log("User ID from params:", userId);

    // Ensure only the account owner can update their account
    if (authUserId.toString() !== userId.toString()) {
      return next(new APPError(messages.user.unauthorized, 401));
    }
    // Fetch the user by ID
    const userExists = await User.findById(userId);
    if (!userExists) {
      return next(new AppError(messages.user.notFound, 404));
    }

    // Check for conflicting email or mobile number
    if (email || mobileNumber) {
      const conflictUser = await User.findOne({
        $or: [{ email }, { mobileNumber }],
        _id: { $ne: authUserId }, // Exclude the current user from the check
      });

      if (conflictUser) {
        return next(
          new AppError("Email or mobile number already exists.", 409)
        );
      }
    }

    // Update user fields if provided
    if (firstName) userExists.firstName = firstName;
    if (lastName) userExists.lastName = lastName;
    if (mobileNumber) userExists.mobileNumber = mobileNumber;
    if (email) userExists.email = email;
    if (recoveryEmail) userExists.recoveryEmail = recoveryEmail;
    if (DOB) userExists.DOB = DOB;
    // if (userId) userExists.userId = userId;

    // Save the updated user data to the database
    const updatedUser = await userExists.save();
    if (!updatedUser) {
      return next(new AppError(messages.user.failToUpdate, 500));
    }

    // Send a success response
    return res.status(200).json({
      message: messages.user.updateSuccessfully,
      success: true,
      data: updatedUser,
    });

  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};


// 4- Delete Account
export const deleteAccount = async (req, res, next) => {
  try {
    const { userId } = req.params;
    // console.log('User ID from params:', userId); // تحقق من تمرير الـ userId

    const auth = await User.findById(userId);
    if (!auth) {
      return next(new AppError(messages.user.notFound, 404));
    }

    if (userId !== req.authUser._id.toString()) {
      return next(new AppError(messages.user.notAuthorized, 403));
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return next(new AppError(messages.user.failToDelete, 500));
    }
    await Application.deleteMany({userId})
    await Job.deleteMany({addedBy : userId})
    await Company.deleteMany({companyHR : userId})


    return res.status(200).json({
      message: messages.user.deleteSuccessfully,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// 5- Get User Account Data
export const getUserAccountData = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Fetch the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError(messages.user.notFound, 404));
    }

    // Ensure only the owner can retrieve their account data
    if (userId !== req.authUser._id.toString()) {
      return next(new AppError(messages.user.notAuthorized, 403));
    }

    // Send a success response with user data
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
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
  const user = await User.findById(req.authUser._id);

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
// 1. Step 1: Send OTP for Password Reset
export const sendResetPasswordOTP = async (req, res, next) => {
  const { email } = req.body;

  // Check if the user exists
  const authUser = await User.findOne({ email });
  if (!authUser) {
    return next(new AppError(messages.user.notFound, 404));
  }

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
  };
  
  // Generate OTP (One-Time Password) securely
  const otp = generateOTP();
  const hashedOTP = bcrypt.hashSync(otp, 8); // Hash the OTP
  authUser.otp = hashedOTP;
  authUser.otpExpired = Date.now() + 10 * 60 * 1000; // Set expiration

  await authUser.save();

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

// 2. Step 2: Verify OTP and Reset Password
export const resetPasswordWithOTP = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  // Check if the user exists
  const autUser = await User.findOne({ email });
  if (!autUser) {
    return next(new AppError(messages.user.notFound, 404));
  }
  // console.log("User document at verification:", autUser); // Log the user object

  // Check if OTP exists and is not expired
  if (!autUser.otp || !autUser.otpExpired) {
    return next(new AppError("OTP not found or expired", 400));
  }
  
  
  // Verify the OTP
  const isValidOTP = await bcrypt.compare(otp, autUser.otp);
  if (!isValidOTP || Date.now() > autUser.otpExpired) {
    return next(new AppError("Invalid or expired OTP", 400));
  }
  // console.log("Provided OTP:", otp);
  // console.log("Stored OTP (hashed):", autUser.otp);
  // console.log("OTP Expiry Time:", autUser.otpExpired);
  // console.log("Current Time:", Date.now());

  // Hash and update the new password
  const hashedPassword = bcrypt.hashSync(newPassword, 8);
  autUser.password = hashedPassword;

  // Clear OTP fields
  autUser.otp = undefined;
  autUser.otpExpired = undefined;

  await autUser.save();
  // console.log("User document after saving OTP:", autUser);

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
