import joi from "joi";
import { generalFields } from "../../middleware/vaildation.js";

export const addApplicationVal =joi.object({
  jobId: generalFields.jobId,
  // userId: generalFields.userId,
  userTechSkills: generalFields.userTechSkills,
  userSoftSkills: generalFields.userSoftSkills,
  // userResume: generalFields.userResume, 
});
