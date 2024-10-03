// authetication.js
import { User } from "../../db/index.js";
import { AppError } from "../utils/appError.js";
import { status } from "../utils/constant/enums.js";
import { messages } from "../utils/constant/messages.js";
import { verifyToken } from "../utils/token.js";

export const isAuthenticated = () => {
  return async (req, res, next) => {
    try {
      const token = req.headers.token || req.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new AppError('Unauthorized: Token is missing', 401));
      }

      const decoded = verifyToken({ token });
      if (decoded.message) {
        return next(new AppError(decoded.message, 401));
      }

      const authUser = await User.findOne({ _id: decoded._id, status: status.ONLINE });
      if (!authUser) {
        return next(new AppError(messages.user.notFound, 404));
      }

      req.authUser = authUser;
      next();
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
  };
};
