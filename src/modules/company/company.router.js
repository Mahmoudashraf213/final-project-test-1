import { Router } from "express";
import { isValid } from "../../middleware/vaildation.js";

const companyRouter = Router()


// 1 -add company 
companyRouter.post('/',isValid())
export default companyRouter