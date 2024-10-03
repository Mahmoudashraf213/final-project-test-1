import joi from 'joi';
import { generalFields } from '../../middleware/vaildation.js';

// add company vaildation
export const addCompanyVal = joi.object({
  companyName: generalFields.companyName,
  description: generalFields.description,
  industry: generalFields.industry,
  address: generalFields.address,
  numberOfEmployees: generalFields.numberOfEmployees,
  companyEmail: generalFields.companyEmail,
  companyHR: generalFields.companyHR,
  addedBy: generalFields.addedBy,
  jobs: generalFields.jobs
});

// update company data
export const updateCompanyVal = joi.object({
  companyName: generalFields.companyName,
  description: generalFields.description,
  industry: generalFields.industry,
  address: generalFields.address,
  numberOfEmployees: generalFields.numberOfEmployees,
  companyEmail: generalFields.companyEmail,
  companyHR: generalFields.companyHR,
  companyId: generalFields.companyId,
  // jobTitle: generalFields.jobTitle,
  // jobDescription : generalFields.jobDescription
}).fork(['companyName', 'description', 'industry', 'address', 'numberOfEmployees', 'companyEmail', 'companyHR'], (schema) => schema.optional());;

// Delete company data 
export const deleteCompanyVal = joi.object({
  companyId: generalFields.companyId, // Assuming you have defined a companyId in your generalFields
}).required();

// search for company by name
export const searchCompanyByName = joi.object({
  companyName: generalFields.companyName.required(),
})

// Get all applications for specific Job
export const getAllSpecificAppVal = joi.object({
  jobId: generalFields.jobId,
}) 