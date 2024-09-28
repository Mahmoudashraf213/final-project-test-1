import { authRouter } from "./modules/index.js";
import { globalErrorHandling } from "./utils/appError.js";
export const bootStrap = (app,express) => {
  // parse req
  app.use(express.json());
  // public foilder
  app.use('/uploads',express.static('uploads'))
  // routing
  app.use('/auth',authRouter)
  // golabl error handler
  app.use(globalErrorHandling)
}