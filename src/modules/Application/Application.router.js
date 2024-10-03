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

// Route to add a new application
appRouter.post(
  "/",
  isAuthenticated(), // User must be authenticated
  isAuthorized([roles.USER]),
  cloudUpload().single("pdf"),
  asyncHandler(addApplication)
);

export default appRouter;
