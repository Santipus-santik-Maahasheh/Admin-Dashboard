import { Router } from "express";
import eah from 'express-async-handler';
import { verifyToken } from "../middleware/verifyToken";
import { applyLeave, viewLeave, markAttendance, viewAttendance } from "../controller/EmployeeController";

export const empRouter = Router();

empRouter.post('/leave/apply', verifyToken, eah(applyLeave));
empRouter.get('/leave', verifyToken, eah(viewLeave));

empRouter.post('/attendance', verifyToken, eah(markAttendance));
empRouter.get('/attendance', verifyToken, eah(viewAttendance));
