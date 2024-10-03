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

// add job
jobRouter.post('/',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR]),
  isValid(addJobVal),
  asyncHandler(addJob)
)

// update job
jobRouter.put('/update/:jobId',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR]),
  isValid(updateJobVal),
  asyncHandler(updateJob)
)

// delete job
jobRouter.delete('/delete/:jobId',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR]),
  isValid(deleteJobVal),
  asyncHandler(deleteJob)
)

// Get all Jobs with their company’s information.
jobRouter.get('/jobs',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR, roles.USER]),
  asyncHandler(getAllJobsWithCompanyInfo)
)

// Get all Jobs for a specific company.
jobRouter.get('/get/jobs',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR, roles.USER]),
  isValid(getJobsByCompanyVal),
  asyncHandler(getJobsByCompany)
)

// Get all Jobs that match the following filters 
jobRouter.get('/getall/jobs',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR, roles.USER]),
  isValid(getFilteredJobsVal),
  asyncHandler(getFilteredJobs)
)

// Apply to Job
jobRouter.post('/apply/:jobId',
  isAuthenticated(),
  isAuthorized([roles.USER]),
  cloudUpload().single('userResume'),
  isValid(applyToJobVal),
  asyncHandler(applyJob)
)
export default jobRouter