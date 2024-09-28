const generateMessage = (entity) => ({
  alreadyExist: `${entity} already exist`,
  notFound: `${entity} not found`,
  failToCreate: `fail to create ${entity} `,
  failToUpdate: `fail to update ${entity} `,
  createSuccessfully: `create ${entity} Successfully`,
  updateSuccessfully: `update ${entity} Successfully`,
  deleteSuccessfully: `delete ${entity} Successfully`,
});

export const messages = {
  company:generateMessage('company'),
  job:generateMessage('job'),
  application:generateMessage('application'),
  user:generateMessage("user"),
  user: {
    ...generateMessage('user'),
    verified: "user verified successfully",
    notAuthorized: "user not authorized",
    invalidCredntiols: "invalid Credntiols",
    notVerified: "not Verified",
    loginSuccessfully: "login successfully",
  }
};
