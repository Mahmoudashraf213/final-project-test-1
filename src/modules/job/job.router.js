import { Router } from "express";
import { isValid } from "../../middleware/vaildation.js";
import { asyncHandler } from "../../utils/appError.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enums.js";
import { addJob, applyJob, deleteJob, getAllJobsWithCompanyInfo, getFilteredJobs, getJobsByCompany, updateJob } from "./job.controller.js";
import { addJobVal, applyToJobVal, deleteJobVal, getFilteredJobsVal, getJobsByCompanyVal, updateJobVal } from "./job.vaildation.js";
import { cloudUpload } from "../../utils/multer-cloud.js";

const jobRouter = Router()

/**
 * @route POST /jobs
 * @description Add a new job to the system.
 * @access Company HR only.
 * @param {Object} req - The request object containing job details.
 * @param {string} req.body.title - The title of the job (required).
 * @param {string} req.body.description - The description of the job (required).
 * @param {string} req.body.companyId - The ID of the company associated with the job (required).
 * @param {string} req.body.location - The location of the job (optional).
 * @param {string[]} req.body.skills - An array of skills required for the job (optional).
 * @param {number} req.body.salary - The salary offered for the job (optional).
 * @param {Date} req.body.deadline - The application deadline for the job (optional).
 * @returns {Object} 201 - An object containing a success message and the created job data.
 * @returns {Object} 400 - An error object if validation fails.
 * @returns {Object} 403 - An error object if the user is not authorized.
 * @returns {Object} 500 - An error object if an internal server error occurs.
 */

// 1- add job
jobRouter.post('/',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR]),
  isValid(addJobVal),
  asyncHandler(addJob)
)

/**
 * @route PUT /jobs/update/:jobId
 * @description Update an existing job in the system.
 * @access Company HR only.
 * @param {string} jobId - The ID of the job to be updated (in the URL parameters).
 * @param {Object} req - The request object containing the updated job details.
 * @param {string} [req.body.title] - The new title of the job (optional).
 * @param {string} [req.body.description] - The new description of the job (optional).
 * @param {string} [req.body.location] - The new location of the job (optional).
 * @param {string[]} [req.body.skills] - An array of new skills required for the job (optional).
 * @param {number} [req.body.salary] - The new salary offered for the job (optional).
 * @param {Date} [req.body.deadline] - The new application deadline for the job (optional).
 * @returns {Object} 200 - An object containing a success message and the updated job data.
 * @returns {Object} 400 - An error object if validation fails or if the job ID is not valid.
 * @returns {Object} 403 - An error object if the user is not authorized.
 * @returns {Object} 404 - An error object if the job is not found.
 * @returns {Object} 500 - An error object if an internal server error occurs.
 */

// 2- update job
jobRouter.put('/update/:jobId',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR]),
  isValid(updateJobVal),
  asyncHandler(updateJob)
)

/**
 * @route DELETE /jobs/delete/:jobId
 * @description Delete an existing job from the system.
 * @access Company HR only.
 * @param {string} jobId - The ID of the job to be deleted (in the URL parameters).
 * @returns {Object} 200 - An object containing a success message indicating the job was deleted.
 * @returns {Object} 400 - An error object if validation fails or if the job ID is not valid.
 * @returns {Object} 403 - An error object if the user is not authorized.
 * @returns {Object} 404 - An error object if the job is not found.
 * @returns {Object} 500 - An error object if an internal server error occurs.
 */

// 3- delete job
jobRouter.delete('/delete/:jobId',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR]),
  isValid(deleteJobVal),
  asyncHandler(deleteJob)
)

/**
 * @route GET /jobs
 * @description Retrieve all jobs along with associated company information.
 * @access Company HR and Users.
 * @returns {Object[]} 200 - An array of job objects, each containing job details and associated company information.
 * @returns {Object} 403 - An error object if the user is not authorized.
 * @returns {Object} 500 - An error object if an internal server error occurs.
 */

// 4- Get all Jobs with their company’s information.
jobRouter.get('/jobs',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR, roles.USER]),
  asyncHandler(getAllJobsWithCompanyInfo)
)

/**
 * @route GET /get/jobs
 * @description Retrieve jobs associated with a specific company.
 * @access Company HR and Users.
 * @param {string} companyId - The ID of the company for which to retrieve jobs.
 * @returns {Object[]} 200 - An array of job objects associated with the specified company.
 * @returns {Object} 403 - An error object if the user is not authorized.
 * @returns {Object} 404 - An error object if the specified company does not have any jobs.
 * @returns {Object} 500 - An error object if an internal server error occurs.
 */

// 5- Get all Jobs for a specific company.
jobRouter.get('/get/jobs',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR, roles.USER]),
  isValid(getJobsByCompanyVal),
  asyncHandler(getJobsByCompany)
)

/**
 * @route GET /getall/jobs
 * @description Retrieve all jobs with optional filtering criteria.
 * @access Company HR and Users.
 * @param {Object} req.query - The query parameters for filtering jobs.
 * @param {string} [req.query.title] - Optional job title to filter jobs by.
 * @param {string} [req.query.location] - Optional location to filter jobs by.
 * @param {string} [req.query.jobType] - Optional job type (e.g., full-time, part-time) to filter jobs by.
 * @returns {Object[]} 200 - An array of job objects that match the filtering criteria.
 * @returns {Object} 403 - An error object if the user is not authorized.
 * @returns {Object} 500 - An error object if an internal server error occurs.
 */

// 6- Get all Jobs that match the following filters 
jobRouter.get('/getall/jobs',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR, roles.USER]),
  isValid(getFilteredJobsVal),
  asyncHandler(getFilteredJobs)
)

/**
 * @route POST /apply/:jobId
 * @description Submit an application for a specific job with a resume.
 * @access Users must be authenticated and authorized to apply.
 * @param {string} jobId - The ID of the job to which the user is applying.
 * @param {Object} req.body - The application data.
 * @param {string} req.body.userTechSkills - The technical skills of the user.
 * @param {string} req.body.userSoftSkills - The soft skills of the user.
 * @param {Object} req.file - The uploaded resume file.
 * @returns {Object} 201 - The created application object.
 * @returns {Object} 400 - An error object if the resume file is not provided or validation fails.
 * @returns {Object} 404 - An error object if the job does not exist.
 * @returns {Object} 500 - An error object if an internal server error occurs.
 */

// 7- Apply to Job
jobRouter.post('/apply/:jobId',
  isAuthenticated(),
  isAuthorized([roles.USER]),
  cloudUpload().single('userResume'),
  isValid(applyToJobVal),
  asyncHandler(applyJob)
)
export default jobRouter