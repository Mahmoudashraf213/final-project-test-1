import { User, Company, Job, Application } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
import cloudinary from "../../utils/cloud.js";
/**
 * @function addApplication
 * @description Handles the creation of a job application, including uploading a resume to Cloudinary and saving the application to the database. If any step fails, it rolls back the resume upload by deleting the file from Cloudinary.
 * 
 * @async
 * @param {Object} req - The request object containing the job ID, tech skills, soft skills, and the uploaded resume file. Also includes the authenticated user's ID.
 * @param {Object} res - The response object used to send back the success message and the created application data.
 * @param {Function} next - The next middleware function to handle errors.
 * 
 * @throws Will throw an error if the job doesn't exist, if the resume file isn't uploaded, or if there's an issue saving the application.
 * 
 * @returns {Object} On success, returns a JSON response containing a success message and the created application data.
 */
// 1- add Application 
export const addApplication = async (req, res, next) => {
  // To store the uploaded resume details for rollback
  let uploadedResume; 

  try {
    // Get data from req
    const { jobId, userTechSkills, userSoftSkills } = req.body;

    // Verify if the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return next(new AppError(messages.application.notFound, 404));
    }

    // Check if the resume file is uploaded
    if (!req.file) {
      return next(new AppError("Resume file is required", 400));
    }

    // Upload resume to Cloudinary
    uploadedResume = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: "final-project/resumes", // Folder path on Cloudinary
    });

    // Create the application object
    const application = new Application({
      jobId,
      userId: req.authUser._id,
      userTechSkills,
      userSoftSkills,
      userResume: { secure_url: uploadedResume.secure_url, public_id: uploadedResume.public_id }, // Use the Cloudinary URL
      addedBy: req.authUser._id, // If you want to keep track of who added the application
    });

    // Add to database
    const createdApplication = await application.save();
    if (!createdApplication) {
      // Rollback on failure
      await cloudinary.v2.uploader.destroy(uploadedResume.public_id); // Delete the uploaded resume from Cloudinary
      return next(new AppError(messages.application.failToCreate, 500));
    }

    // Send response
    return res.status(201).json({
      message: messages.application.createApplication,
      success: true,
      data: createdApplication,
    });
  } catch (error) {
    // Rollback on error: if the application was created but the resume upload failed
    if (uploadedResume) {
      await cloudinary.v2.uploader.destroy(uploadedResume.public_id); // Delete the uploaded resume from Cloudinary
    }
    return next(new AppError(error.message, 500));
  }
};
