import joi from "joi";
import { roles } from "../utils/constant/enums.js";
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
  userId: joi.string().length(24).hex().optional(), 

  
  companyName: joi.string().required(),
  description: joi.string().max(2000).required(),
  industry: joi.string().required(),
  address: joi.string().required(),
  numberOfEmployees: joi.string().valid("1-10", "11-20", "21-50", "51-100", "101-500", "500+").required(),
  companyEmail: joi.string().email().required(),
  companyHR: joi.string().hex().length(24).required(),
  
  jobTitle: joi.string().required(),
  jobLocation: joi.string().valid("onsite", "remotely", "hybrid").required(),
  workingTime: joi.string().valid("part-time", "full-time").required(),
  seniorityLevel: joi.string().valid("Junior", "Mid-Level", "Senior", "Team-Lead", "CTO").required(),
  jobDescription: joi.string().max(2000).required(),
  technicalSkills: joi.array().items(joi.string()).required(),
  softSkills: joi.array().items(joi.string()).required(),
  addedBy: joi.string().hex().length(24).required(),
  
  jobId: joi.string().hex().length(24).required(),
  userId: joi.string().hex().length(24).required(),
  userTechSkills: joi.array().items(joi.string()).required(),
  userSoftSkills: joi.array().items(joi.string()).required(),
  userResume: joi.string().uri().required(), // Assuming the resume is stored as a Cloudinary URL
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