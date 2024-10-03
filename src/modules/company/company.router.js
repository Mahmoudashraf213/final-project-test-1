import { Router } from "express";
import { isValid } from "../../middleware/vaildation.js";
import { addCompanyVal, deleteCompanyVal, getAllSpecificAppVal, getApplicationsReportVal, searchCompanyByName, updateCompanyVal } from "./company.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enums.js";
import { addCompany, deleteCompany,getApplicationsForJob, getApplicationsReport, getCompanyData, searchCompany, updateCompany } from "./company.controller.js";
const companyRouter = Router()

/**
 * @route POST /company
 * @desc Add a new company to the database.
 * @param {object} req.body - The request body containing the company details.
 * @param {string} req.body.companyName - The name of the company (required).
 * @param {string} req.body.description - A brief description of the company (required).
 * @param {string} req.body.industry - The industry in which the company operates (required).
 * @param {string} req.body.address - The company's physical address (required).
 * @param {string} req.body.numberOfEmployees - The size of the company (required).
 * @param {string} req.body.companyEmail - The official email address of the company (required).
 * @param {ObjectId} req.body.companyHR - The ID of the HR user managing the company (required).
 * @param {ObjectId} req.body.createdBy - The ID of the user who created the company record (required).
 * @returns {Object} 201 - A success message with the newly created company data.
 * @returns {Object} 400 - Bad request error if validation fails or required fields are missing.
 * @returns {Object} 409 - Conflict error if a company with the same name or email already exists.
 */

// 1 -add company 
companyRouter.post('/',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR]),
  isValid(addCompanyVal),
  asyncHandler(addCompany)
)

/**
 * @route PUT /company/:companyId
 * @desc Update the details of an existing company.
 * @param {string} companyId - The ID of the company to be updated (required).
 * @param {object} req.body - The request body containing the updated company details.
 * @param {string} [req.body.companyName] - The new name of the company (optional).
 * @param {string} [req.body.description] - A brief description of the company (optional).
 * @param {string} [req.body.industry] - The new industry in which the company operates (optional).
 * @param {string} [req.body.address] - The new physical address of the company (optional).
 * @param {string} [req.body.numberOfEmployees] - The new size of the company (optional).
 * @param {string} [req.body.companyEmail] - The new official email address of the company (optional).
 * @returns {Object} 200 - A success message with the updated company data.
 * @returns {Object} 400 - Bad request error if validation fails or required fields are missing.
 * @returns {Object} 404 - Not found error if the company with the specified ID does not exist.
 * @returns {Object} 409 - Conflict error if the updated company data conflicts with existing data.
 */
// 2- Update company data
companyRouter.put("/:companyId",
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR]),
  isValid(updateCompanyVal),
  asyncHandler(updateCompany)
); 

/**
 * @route DELETE /company/:companyId
 * @desc Delete an existing company by its ID.
 * @param {string} companyId - The ID of the company to be deleted (required).
 * @returns {Object} 204 - No content if the company was successfully deleted.
 * @returns {Object} 404 - Not found error if the company with the specified ID does not exist.
 * @returns {Object} 403 - Forbidden error if the user does not have permission to delete the company.
 * @returns {Object} 400 - Bad request error if validation fails.
 */
// 3- Delete company data 
companyRouter.delete('/:companyId',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR]),
  isValid(deleteCompanyVal),
  asyncHandler(deleteCompany)
)

/**
 * @route GET /company/get/:companyId
 * @desc Retrieve data for a specific company by its ID.
 * @param {string} companyId - The ID of the company whose data is to be retrieved (required).
 * @returns {Object} 200 - The company data if found.
 * @returns {Object} 404 - Not found error if the company with the specified ID does not exist.
 * @returns {Object} 403 - Forbidden error if the user does not have permission to access the company data.
 */

// 4- Get company data 
companyRouter.get('/get/:companyId',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR]),
  asyncHandler(getCompanyData)
)

/**
 * @route GET /company/search-company
 * @desc Search for a company by its name.
 * @param {string} name - The name of the company to search for (required).
 * @returns {Object} 200 - An array of companies matching the search criteria.
 * @returns {Object} 404 - Not found error if no companies match the search criteria.
 * @returns {Object} 403 - Forbidden error if the user does not have permission to access the search functionality.
 */
// 5- Search for a company with a name. 
companyRouter.get('/search-company',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR,roles.USER]),
  isValid(searchCompanyByName),
  asyncHandler(searchCompany)
)

/**
 * @route GET /company/job-applications/:jobId
 * @desc Retrieve all applications for a specific job by job ID.
 * @param {string} jobId - The ID of the job for which to retrieve applications (required).
 * @returns {Object} 200 - An array of applications associated with the specified job.
 * @returns {Object} 404 - Not found error if the job does not exist or no applications are found.
 * @returns {Object} 403 - Forbidden error if the user does not have permission to access the job applications.
 */
// 6- Get all applications for specific Job
companyRouter.get('/job-applications/:jobId',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR,roles.USER]),
  isValid(getAllSpecificAppVal),
  asyncHandler(getApplicationsForJob)
)

/**
 * @route GET /company/:companyId/applications/export
 * @desc Export all applications for a specific company to an Excel file.
 * @param {string} companyId - The ID of the company for which to export applications (required).
 * @returns {Object} 200 - An Excel file containing all applications for the specified company.
 * @returns {Object} 404 - Not found error if the company does not exist or has no applications.
 * @returns {Object} 403 - Forbidden error if the user does not have permission to export the applications.
 */
// 7- # Bonus Points
companyRouter.get('/applications-report',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR]),
  isValid(getApplicationsReportVal),
  asyncHandler(getApplicationsReport)
)
export default companyRouter