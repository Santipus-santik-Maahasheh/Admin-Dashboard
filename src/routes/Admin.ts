import { Router } from "express";
import eah from 'express-async-handler'
import { verifyToken } from "../middleware/verifyToken";
import { getAllEmployees } from "../controller/AdminController";
export const adminRouter=Router()

adminRouter.get('/employees',verifyToken,eah(getAllEmployees))