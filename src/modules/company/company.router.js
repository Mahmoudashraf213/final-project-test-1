import { Router } from "express";
import { isValid } from "../../middleware/vaildation.js";
import { addCompanyVal, deleteCompanyVal, getAllSpecificAppVal, searchCompanyByName, updateCompanyVal } from "./company.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enums.js";
import { addCompany, deleteCompany, exportApplicationsToExcel, getApplicationsForJob, getCompanyData, searchCompany, updateCompany } from "./company.controller.js";
const companyRouter = Router()


// 1 -add company 
companyRouter.post('/',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR]),
  isValid(addCompanyVal),
  asyncHandler(addCompany)
)

// 2- Update company data
companyRouter.put("/:companyId",
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR]),
  isValid(updateCompanyVal),
  asyncHandler(updateCompany)
); 

// 3- Delete company data 
companyRouter.delete('/:companyId',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR]),
  isValid(deleteCompanyVal),
  asyncHandler(deleteCompany)
)

// 4- Get company data 
companyRouter.get('/get/:companyId',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR]),
  asyncHandler(getCompanyData)
)

// 5- Search for a company with a name. 
companyRouter.get('/search-company',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR,roles.USER]),
  isValid(searchCompanyByName),
  asyncHandler(searchCompany)
)

// 6- Get all applications for specific Job
companyRouter.get('/job-applications/:jobId',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR,roles.USER]),
  isValid(getAllSpecificAppVal),
  asyncHandler(getApplicationsForJob)
)

// 7- # Bonus Points
companyRouter.get('/:companyId/applications/export',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR]),
  asyncHandler(exportApplicationsToExcel)
)
export default companyRouter