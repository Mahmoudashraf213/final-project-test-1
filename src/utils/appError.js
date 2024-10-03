import { deleteCloudImage } from "./cloud.js";
// Custom AppError class
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Adding an operational property for distinguishing between types of errors
    Error.captureStackTrace(this, this.constructor);
  }
}

// Async handler
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      return next(new AppError(err.message, err.statusCode || 500)); // Ensure statusCode is provided
    });
  };
};

// Global error handler
export const globalErrorHandling = async (err, req, res, next) => {

  // rollback cloud
  if (req.failResume) {
      await deleteCloudImage(req.failResume.public_id)
  }

  return res.status(err.statusCode || 500).json({
      message: err.message,
      success: false
  })

}
