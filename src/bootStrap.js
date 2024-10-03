import {  appRouter, authRouter, companyRouter, jobRouter } from "./modules/index.js";
import { globalErrorHandling } from "./utils/appError.js";
export const bootStrap = (app,express) => {
  // parse req
  app.use(express.json());
  // public foilder
  app.use('/uploads',express.static('uploads'))
  // routing
  app.use('/auth',authRouter)
  app.use('/company',companyRouter)
  app.use('/job',jobRouter)
  app.use('/application',appRouter)
  // golabl error handler
  app.use(globalErrorHandling)
}