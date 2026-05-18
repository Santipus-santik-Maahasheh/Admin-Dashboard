import { Router } from "express";
import eah from 'express-async-handler'
import { verifyToken } from "../middleware/verifyToken";
import {
    getAllEmployees,
    viewAllLeaveRequests,
    approveLeaveRequest,
    rejectLeaveRequest,
} from "../controller/AdminController";

export const adminRouter=Router()

adminRouter.get('/employees', verifyToken, eah(getAllEmployees));
adminRouter.get('/leaves', verifyToken, eah(viewAllLeaveRequests));
adminRouter.patch('/leaves/:id/approve', verifyToken, eah(approveLeaveRequest));
adminRouter.patch('/leaves/:id/reject', verifyToken, eah(rejectLeaveRequest)); 