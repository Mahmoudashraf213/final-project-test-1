import { Router } from "express";
import { isValid } from "../../middleware/vaildation.js";
import { addCompanyVal, deleteCompanyVal, updateCompanyVal } from "./company.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enums.js";
import { addCompany, deleteCompany, getApplicationsForJob, getCompanyData, searchCompany, updateCompany } from "./company.controller.js";
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
companyRouter.get('/:companyId',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR]),
  asyncHandler(getCompanyData)
)

// 5- Search for a company with a name. 
companyRouter.get('/search',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR,roles.USER]),
  asyncHandler(searchCompany)
)

// 6- Get all applications for specific Job
companyRouter.get('/jobId/application',
  isAuthenticated(),
  isAuthorized([roles.COMPANY_HR]),
  asyncHandler(getApplicationsForJob)
)
export default companyRouter