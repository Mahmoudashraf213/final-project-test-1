import joi from 'joi';
import { generalFields } from '../../middleware/vaildation.js';

// 1- Add Job
export const addJobVal = joi.object({
  jobTitle: generalFields.jobTitle,
  jobLocation: generalFields.jobLocation,
  workingTime: generalFields.workingTime,
  seniorityLevel: generalFields.seniorityLevel,
  jobDescription: generalFields.jobDescription,
  technicalSkills: generalFields.technicalSkills,
  softSkills: generalFields.softSkills,
  addedBy: generalFields.addedBy,
  companyId : generalFields.companyId,
});

// 2- Update Job 
export const updateJobVal = joi.object({
  jobTitle: generalFields.jobTitle,
  jobLocation: generalFields.jobLocation,
  workingTime: generalFields.workingTime,
  seniorityLevel: generalFields.seniorityLevel,
  jobDescription: generalFields.jobDescription,
  technicalSkills: generalFields.technicalSkills,
  softSkills: generalFields.softSkills,
  jobId:generalFields.jobId,
  addedBy:generalFields.addedBy,
});

// 3- Delete job
export const deleteJobVal = joi.object({
  jobId:generalFields.jobId,
})

// 5- Get all Jobs for a specific company.
export const getJobsByCompanyVal = joi.object({
  companyName: generalFields.companyName.required(),
  // companyId: generalFields.companyId,
})

// 6- Get all Jobs that match the following filters 
export const getFilteredJobsVal = joi.object({
  workingTime: generalFields.workingTime.optional(),
  jobLocation: generalFields.jobLocation.optional(),
  seniorityLevel: generalFields.seniorityLevel.optional(),
  jobTitle: generalFields.jobTitle.optional(),
  technicalSkills: generalFields.technicalSkills.optional(),  
})

// 7- Apply To Job
export const applyToJobVal = joi.object({
  jobId: generalFields.jobId.required(),
  userTechSkills: generalFields.technicalSkills.required(), 
  userSoftSkills: generalFields.softSkills.required(),
  // userResume: generalFields.userResume.required()
})