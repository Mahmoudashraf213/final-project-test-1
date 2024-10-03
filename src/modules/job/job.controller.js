import { Job, Company, Application } from "../../../db/index.js";
import { ApiFeature } from "../../utils/apiFeatures.js";
import { AppError} from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
import { addJobVal,  getJobsByCompanyVal } from "./job.vaildation.js";
import cloudinary from "../../utils/cloud.js";
// 1- add job
export const addJob = async (req, res, next) => {
  try {
    // Validate request body against addJobVal schema
    const { error } = addJobVal.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Extract data from request body
    const {
      jobTitle,
      jobLocation,
      workingTime,
      seniorityLevel,
      jobDescription,
      technicalSkills,
      softSkills,
      companyId,
    } = req.body;

    // const company = await Company.findOne({companyHR: req.authUser._id})
    // Create a new job entry
    const job = await Job.create({
      jobTitle,
      jobLocation,
      workingTime,
      seniorityLevel,
      jobDescription,
      technicalSkills,
      softSkills,
      addedBy: req.authUser._id,
      companyId,
      // company: company ? company._id : null,
    });
    // Push the job ID into the company's jobs array
    await Company.findByIdAndUpdate(companyId, { $push: { jobs: job._id } });

    // Respond with success message
    res.status(201).json({
      message: messages.job.createSuccessfully,
      success: true,
      job,
    });
  } catch (error) {
    // Error handling
    next(error);
  }
};

// 2- Update Job
export const updateJob = async (req, res, next) => {
  try {
    // Check if the user has the Company_HR role
    if (req.authUser.role !== "Company_HR") {
      return res
        .status(403)
        .json({
          message: "Access denied. You do not have permission to update jobs.",
        });
    }

    // Validate request body against addJobVal schema
    const { error } = addJobVal.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { jobId } = req.params;
    const {
      jobTitle,
      jobLocation,
      workingTime,
      seniorityLevel,
      jobDescription,
      technicalSkills,
      softSkills,
    } = req.body;

    // Find the job by ID and ensure it belongs to the same company as the user
    const job = await Job.findOne({ _id: jobId, addedBy: req.authUser._id });

    if (!job) {
      return res
        .status(404)
        .json({
          message:
            "Job not found or you don't have permission to update this job.",
        });
    }

    // Update the job with the new data
    job.jobTitle = jobTitle;
    job.jobLocation = jobLocation;
    job.workingTime = workingTime;
    job.seniorityLevel = seniorityLevel;
    job.jobDescription = jobDescription;
    job.technicalSkills = technicalSkills;
    job.softSkills = softSkills;

    await job.save();

    // Respond with success message
    res.status(200).json({
      message: messages.job.updateSuccessfully,
      success: true,
      job,
    });
  } catch (error) {
    // Error handling
    next(error);
  }
};

// 3- Delete Job
export const deleteJob = async (req, res, next) => {
  try {
    // Check if the user has the Company_HR role
    if (req.authUser.role !== "Company_HR") {
      return res
        .status(403)
        .json({
          message: "Access denied. You do not have permission to delete jobs.",
        });
    }

    const { jobId } = req.params;

    // Find the job by ID and ensure it belongs to the same company as the user
    const job = await Job.findOne({ _id: jobId, addedBy: req.authUser._id });

    if (!job) {
      return res
        .status(404)
        .json({
          message:
            "Job not found or you don't have permission to delete this job.",
        });
    }

    await Application.deleteMany(jobId)
    // Delete the job
    await job.deleteOne();

    // Respond with success message
    res.status(200).json({
      message: messages.job.deleteSuccessfully,
      success: true,
    });
  } catch (error) {
    // Error handling
    next(error);
  }
};

// 4- Get all Jobs with their company’s information.
export const getAllJobsWithCompanyInfo = async (req, res, next) => {
  try {
    // Check if the user has the required roles (User or Company_HR)
    const allowedRoles = ["User", "Company_HR"];
    if (!allowedRoles.includes(req.authUser.role)) {
      return res
        .status(403)
        .json({
          message: "Access denied. You do not have permission to view jobs.",
        });
    }

    // Initialize the query for jobs with company information
    const mongooseQuery = Job.find().populate(
      "addedBy",
      "companyName industry numberOfEmployees companyEmail"
    );

    // Apply filtering, sorting, selection, and pagination using ApiFeature
    const apiFeature = new ApiFeature(mongooseQuery, req.query)
      .filter()
      .sort()
      .select()
      .pagination();

    // Execute the query
    const jobs = await apiFeature.mongooseQuery;

    // Respond with jobs
    res.status(200).json({
      message: messages.job.getAllSuccessfully,
      success: true,
      results: jobs.length,
      jobs,
    });
  } catch (error) {
    // Error handling
    next(error);
  }
};

// 5- Get all Jobs for a specific company.
export const getJobsByCompany = async (req, res, next) => {
  try {
    // Check if the user has the User or Company_HR role
    if (req.authUser.role !== "User" && req.authUser.role !== "Company_HR") {
      return next(
        new AppError(
          messages.user.notAuthorized,
          403
        )
      );
    }

    // Validate the query against the schema
    const { error } = getJobsByCompanyVal.validate(req.query);
    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }

    const { companyName } = req.query;

    // Fetch jobs associated with the specified company name
    const company = await Company.findOne({ companyName });
    if (!company) {
      return next(new AppError(messages.company.notFound, 404));
    }

    const jobs = await Job.find({ companyId: company._id });

    if (jobs.length === 0) {
      return next(new AppError(messages.job.notFound, 404));
    }

    // Respond with the list of jobs
    res.status(200).json({
      message: messages.job.getAllSuccessfully,
      success: true,
      results: jobs.length,
      jobs,
    });
  } catch (error) {
    return next(error);
  }
};

// 6- Get all Jobs that match the following filters 
export const getFilteredJobs = async (req, res, next) => {
  try {
    // Check if the user has the User or Company_HR role
    if (req.authUser.role !== "User" && req.authUser.role !== "Company_HR") {
      return next(new AppError(messages.user.notAuthorized, 403));
    }

    // Extract query parameters for filtering
    const { workingTime, jobLocation, seniorityLevel, jobTitle, technicalSkills } = req.query;

    // Build the filter object dynamically
    const filter = {};
    
    if (workingTime) {
      filter.workingTime = workingTime;
    }
    
    if (jobLocation) {
      filter.jobLocation = jobLocation;
    }
    
    if (seniorityLevel) {
      filter.seniorityLevel = seniorityLevel;
    }
    
    if (jobTitle) {
      filter.jobTitle = new RegExp(jobTitle, "i");  // Case-insensitive search
    }
    
    if (technicalSkills) {
      filter.technicalSkills = { $in: technicalSkills.split(",") };  // Assuming comma-separated list
    }

    // Fetch jobs that match the filters
    const jobs = await Job.find(filter);

    // Check if jobs were found
    if (jobs.length === 0) {
      return next(new AppError(messages.job.notFound, 404));
    }

    // Respond with the list of filtered jobs
    res.status(200).json({
      message: messages.job.getAllSuccessfully,
      success: true,
      results: jobs.length,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

// 7- Apply to Job
export const applyJob = async (req, res, next) => {
  try {
    // Validate request data here (or use middleware)

    // Get data from req 
    const { jobId } = req.params;
    const userId = req.authUser._id;
    let { userTechSkills, userSoftSkills } = req.body;

    // Ensure the skills are arrays
    if (typeof userTechSkills === 'string') {
      userTechSkills = JSON.parse(userTechSkills); // Convert string to array if needed
    }

    if (typeof userSoftSkills === 'string') {
      userSoftSkills = JSON.parse(userSoftSkills); // Convert string to array if needed
    }

    // Check job existence
    const jobExist = await Job.findById(jobId);
    if (!jobExist) {
      return next(new AppError(messages.job.notExist, 404));
    }

    // Check if the user has already applied to this job
    const userApplied = await Application.findOne({ userId, jobId });
    if (userApplied) {
      return next(new AppError(messages.job.alreadyExist, 400));
    }

    // Upload file
    if (!req.file) {
      return next(new AppError(messages.file.required, 400));
    }

    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
      folder: '/Job Search App/resume'
    });

    // Prepare data
    const application = new Application({
      jobId,
      userId,
      userTechSkills,
      userSoftSkills,
      userResume: { secure_url, public_id }
    });

    // Add to db
    const createdApplication = await application.save();

    // Send response
    return res.status(201).json({
      message: messages.job.createSuccessfully,
      success: true,
      data: createdApplication
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
