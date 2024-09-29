// authetication.js
import { User } from "../../db/index.js";
import { AppError } from "../utils/appError.js";
import { status } from "../utils/constant/enums.js";
import { messages } from "../utils/constant/messages.js";
import { verifyToken } from "../utils/token.js";

export const isAuthenticated = () => {
  return async (req, res, next) => {
    try {
      // Log all headers to check the received headers
      // console.log('Headers:', req.headers);

      // Extract the token from headers
      const token = req.headers.token || req.headers.authorization?.split(' ')[1];

      // Check if the token is missing
      if (!token) {
        // console.log('No token found in headers');
        return next(new AppError('Unauthorized: Token is missing', 401));
      }

      // console.log('Extracted Token:', token);

      // Verify the token
      const decoded = verifyToken({ token });
      if (decoded.message) {
        // console.error('Token verification failed:', decoded.message);
        return next(new AppError(decoded.message, 401));
      }

      // console.log('Token verified successfully:', decoded);

      // Check if the user exists in the database and is offline
      const authUser = await User.findOne({ _id: decoded._id, status: status.OFFLINE });
      if (!authUser) {
        return next(new AppError(messages.user.notFound, 404));
      }

      // Attach the authenticated user to the request object
      req.authUser = authUser;
      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
  };
};
