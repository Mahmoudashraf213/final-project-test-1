// enums.js
export const roles = {
  USER: "User",
  COMPANY_HR: "Company_HR",
};
Object.freeze(roles);

export const jobLocations = {
  ONSITE: "onsite",
  REMOTELY: "remotely",
  HYBRID: "hybrid",
};
Object.freeze(jobLocations);

export const workingTimes = {
  PART_TIME: "part-time",
  FULL_TIME: "full-time",
};
Object.freeze(workingTimes);

export const seniorityLevels = {
  JUNIOR: "Junior",
  MID_LEVEL: "Mid-Level",
  SENIOR: "Senior",
  TEAM_LEAD: "Team-Lead",
  CTO: "CTO",
};
Object.freeze(seniorityLevels);

export const status = {
  ONLINE: "online",
  OFFLINE: "offline",
  // PENDING: "pending",
  // VERIFIED: "verified",
};

Object.freeze(status);
