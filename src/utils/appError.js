import { deleteCloudImage } from "./cloud.js";
import { deleteFile } from "./file-functions.js";
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
  // Set default status code and message if not provided
  // rollback file system
  if (req.file) {
    deleteFile(req.file.path);
  }
  // rollback cloud
  if (req.failImage) {
    await deleteCloudImage(req.failImage.public_id);
  }
  // delete multi image
  if (req.failImages?.length > 0) {
    for (const public_id of req.failImages) {
      await deleteCloudImage(public_id);
    }
  }
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    message,
    success: false,
  });
};
