import { Router } from "express";
import multer from "multer"; // Middleware for handling file uploads
import { asyncHandler } from "../../utils/appError.js";
import { cloudUpload } from "../../utils/multer-cloud.js";
import { roles } from "../../utils/constant/enums.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { addApplication } from "./Application.controller.js";

const appRouter = Router();

const upload = multer({ dest: "uploads/" }); // Define the upload destination
/**
 * Add a job application for a user.
 * - User must be authenticated and authorized.
 * - Uploads the resume to Cloudinary.
 * - Stores the application data including tech and soft skills.
 *
 * @param {Object} req - Express request object containing job ID, user skills, and resume file.
 * @param {Object} res - Express response object for sending responses to the client.
 * @param {Function} next - Express next middleware function for error handling.
 * @returns {Promise<void>} - Sends a JSON response with success message or error.
 */
// Route to add a new application
appRouter.post(
  "/",
  isAuthenticated(), // User must be authenticated
  isAuthorized([roles.USER]),
  cloudUpload().single("pdf"),
  asyncHandler(addApplication)
);

export default appRouter;
