import { AppError } from "../utils/appError.js";
import { messages } from "../utils/constant/messages.js";

export const isAuthorized = (roles) => {
  return (req, res, next) => {
    // req >> authUser
    if (!roles.includes(req.authUser.role)) {
      console.log('User Role:', req.authUser ? req.authUser.role : 'No User'); // Log the role
      return next(new AppError(messages.user.notAuthorized, 401));
    }
    next()
  };
};
