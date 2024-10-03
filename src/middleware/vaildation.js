import joi from "joi";
import {  jobLocations, roles, seniorityLevels, workingTimes } from "../utils/constant/enums.js";
import { AppError } from "../utils/appError.js";

// Utility function to parse arrays from string inputs
const parseArray = (value, helper) => {
  let data;
  try {
    data = JSON.parse(value);
  } catch (e) {
    return helper.error("Invalid array format");
  }
  
  let schema = joi.array().items(joi.string());
  const { error } = schema.validate(data);
  if (error) {
    return helper.error("Invalid array items");
  }
  return data;
};

const jobSchema = joi.object({
  jobTitle: joi.string().required().messages({
    'string.base': 'Job title must be a string.',
    'string.empty': 'Job title is required.',
  }),
  jobDescription: joi.string().required().messages({
    'string.base': 'Job description must be a string.',
    'string.empty': 'Job description is required.',
  }),
});

export const generalFields = {
  firstName: joi.string().required(),
  lastName: joi.string().required(),
  username: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().pattern(new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)).required(),
  recoveryEmail: joi.string().email(),
  mobileNumber: joi.string().pattern(new RegExp(/^(00201|\+201|01)[0-2,5]{1}[0-9]{8}$/)).required(),
  DOB: joi.date().iso().required(),
  role: joi.string().valid(...Object.values(roles)).default(roles.USER),
  status: joi.string().valid("online", "offline").default("offline"),
  objectId: joi.string().hex().length(24),
  // userId: joi.string().length(24).hex().optional(), 

  
  companyName: joi.string(),
  description: joi.string().max(2000).required(),
  industry: joi.string().required(),
  address: joi.string().required(),
  numberOfEmployees: joi.string().pattern(/^(?:[1-9]\d{0,2})-(?:[1-9]\d{0,2})$/),
  companyEmail: joi.string().email().required(),
  companyHR: joi.string().hex().length(24).required(),
  companyId: joi.string().hex().length(24).required(),
  jobs: joi.array().items(
    joi.object({
      jobTitle: joi.string().required(), 
      jobDescription: joi.string().max(2000).required(), 
    })
  ).optional(),
  
  jobTitle: joi.string().required(),
  jobLocation: joi.string().valid(...Object.values(jobLocations)).required(),
  workingTime: joi.string().valid(...Object.values(workingTimes)).required(),
  seniorityLevel: joi.string().valid(...Object.values(seniorityLevels)).required(),
  jobDescription: joi.string().max(2000).required(),
  technicalSkills: joi.custom(parseArray),
  softSkills: joi.custom(parseArray),
  addedBy: joi.string().hex().length(24).required(),
  
  jobId: joi.string().hex().length(24).required(),
  userId: joi.string().hex().length(24).required(),
  userTechSkills: joi.array().items(joi.string()).required(),
  userSoftSkills: joi.array().items(joi.string()).required(),
  userResume: joi.custom(parseArray), // Assuming the resume is stored as a Cloudinary URL
};

export const isValid = (schema) => {
  return (req, res, next) => {
    let data = { ...req.body, ...req.params, ...req.query }; // Corrected from 'date' to 'data'
    const { error } = schema.validate(data, { abortEarly: false }); // Corrected from 'errro' to 'error'
    if (error) {
      const errArr = [];
      error.details.forEach((err) => {
        errArr.push(err.message);
      });
      return next(new AppError(errArr, 400));
    }
    next();
  };
};

