import { Request, Response } from "express";
import { AuthRequest } from "../middleware/verifyToken";
import {
    getAllEmployeesService,
    approveLeave,
    rejectLeave,
    viewLeaves,
} from '../services/AdminService';

const ensureAdmin = (req: AuthRequest, res: Response): boolean => {
    if (!req.user || req.user.role !== 'Admin') {
        res.status(403).json({ message: 'Admin access required', payload: null });
        return false;
    }
    return true;
};

export const getAllEmployees = async (req: Request, res: Response): Promise<void> => {
    const employees = await getAllEmployeesService();
    res.status(200).json({ message: 'Here you go boss', payload: employees });
};

export const viewAllLeaveRequests = async (req: AuthRequest, res: Response): Promise<void> => {
    if (!ensureAdmin(req, res)) return;
    const leaves = await viewLeaves();
    res.status(200).json({ message: 'Leave requests retrieved', payload: leaves });
};

export const approveLeaveRequest = async (req: AuthRequest, res: Response): Promise<void> => {
    if (!ensureAdmin(req, res)) return;
    const leaveRequestId = req.params.id as string;
    const userId = req.user?.id;
    const updated = await approveLeave(leaveRequestId, userId!);
    if (!updated) {
        res.status(404).json({ message: 'Leave request not found', payload: null });
    }
    res.status(200).json({ message: 'Leave approved', payload: updated });
};

export const rejectLeaveRequest = async (req: AuthRequest, res: Response): Promise<void> => {
    if (!ensureAdmin(req, res)) return;
    const leaveRequestId = req.params.id as string;
    const { rejectionReason } = req.body;
    if (!rejectionReason) {
        res.status(400).json({ message: 'rejectionReason is required', payload: null });
    }
    const userId = req.user?.id;
    const updated = await rejectLeave(leaveRequestId, userId!, rejectionReason);
    if (!updated) {
        res.status(404).json({ message: 'Leave request not found', payload: null });
    }
    res.status(200).json({ message: 'Leave rejected', payload: updated });
}; 