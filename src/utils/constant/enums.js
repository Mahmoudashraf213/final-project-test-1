// enums.js
export const roles = {
  USER: "User",
  COMPANY_HR: "Company_HR",
};
Object.freeze(roles);

export const jobLocation = {
  ONSITE: "onsite",
  REMOTELY: "remotely",
  HYBRID: "hybrid",
};
Object.freeze(jobLocation);

export const workingTime = {
  PART_TIME: "part-time",
  FULL_TIME: "full-time",
};
Object.freeze(workingTime);

export const seniorityLevel = {
  JUNIOR: "Junior",
  MID_LEVEL: "Mid-Level",
  SENIOR: "Senior",
  TEAM_LEAD: "Team-Lead",
  CTO: "CTO",
};
Object.freeze(seniorityLevel);

export const status = {
  ONLINE: "online",
  OFFLINE: "offline",
  // PENDING: "pending",
  // VERIFIED: "verified",
};

Object.freeze(status);
