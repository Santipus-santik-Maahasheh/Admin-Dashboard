import { Request, Response } from "express";
import { AuthRequest } from "../middleware/verifyToken";
import { applyLeave as applyLeaveService, viewLeave as viewLeaveService, markAttendance as markAttendanceService, viewAttendance as viewAttendanceService } from "../services/EmployeeService";

export const applyLeave = async (req: AuthRequest, res: Response): Promise<void> => {
    const { user } = req;
    if (!user || !user.id) {
        res.status(401).json({ message: 'Unauthorized', payload: null });
    }

    const leaveRequest = req.body;
    const appliedLeave = await applyLeaveService(user!.id, user!.organization!, leaveRequest);
    res.status(201).json({ message: 'Leave applied successfully', payload: appliedLeave });
};

export const viewLeave = async (req: AuthRequest, res: Response): Promise<void> => {
    const { user } = req;
    if (!user || !user.id) {
        res.status(401).json({ message: 'Unauthorized', payload: null });
    }

    const leaves = await viewLeaveService(user!.id);
    res.status(200).json({ message: 'Leave requests retrieved successfully', payload: leaves });
};

export const markAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
    const { user } = req;
    if (!user || !user.id) {
        res.status(401).json({ message: 'Unauthorized', payload: null });
    }

    const attendanceRequest = req.body;
    const attendance = await markAttendanceService(user!.id, user!.organization!, attendanceRequest);
    res.status(201).json({ message: 'Attendance recorded successfully', payload: attendance });
};

export const viewAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
    const { user } = req;
    if (!user || !user.id) {
        res.status(401).json({ message: 'Unauthorized', payload: null });
    }

    const attendances = await viewAttendanceService(user!.id);
    res.status(200).json({ message: 'Attendance retrieved successfully', payload: attendances });
};