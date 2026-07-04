import { Response } from "express";
import { AuthRequest } from "../middleware/verifyToken";
import {
    getAllEmployeesService,
    approveLeave,
    rejectLeave,
    viewLeaves,
    createOrgUser,
} from '../services/AdminService';

// Admin and SuperAdmin may use the admin area.
const ensureAdmin = (req: AuthRequest, res: Response): boolean => {
    const role = req.user?.role;
    if (!req.user || (role !== 'Admin' && role !== 'SuperAdmin')) {
        res.status(403).json({ message: 'Admin access required', payload: null });
        return false;
    }
    return true;
};

// Tenant scope for queries: SuperAdmin sees all orgs (undefined), an Admin is
// restricted to their own organization.
const scopeFor = (req: AuthRequest): string | undefined =>
    req.user?.role === 'SuperAdmin' ? undefined : req.user?.organization;

export const getAllEmployees = async (req: AuthRequest, res: Response): Promise<void> => {
    if (!ensureAdmin(req, res)) return;
    const employees = await getAllEmployeesService(scopeFor(req));
    res.status(200).json({ message: 'Here you go boss', payload: employees });
};

export const createEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
    if (!ensureAdmin(req, res)) return;

    // Admins create users within their own org. SuperAdmin must name the target org.
    const organization =
        req.user?.role === 'SuperAdmin' ? req.body?.organization : req.user?.organization;
    if (!organization) {
        res.status(400).json({
            message: 'organization is required',
            payload: null,
        });
        return;
    }

    const role = req.body?.role ?? 'Employee';
    const created = await createOrgUser(req.body, role, organization);
    res.status(201).json({ message: 'User created successfully', payload: created });
};

export const viewAllLeaveRequests = async (req: AuthRequest, res: Response): Promise<void> => {
    if (!ensureAdmin(req, res)) return;
    const leaves = await viewLeaves(scopeFor(req));
    res.status(200).json({ message: 'Leave requests retrieved', payload: leaves });
};

export const approveLeaveRequest = async (req: AuthRequest, res: Response): Promise<void> => {
    if (!ensureAdmin(req, res)) return;
    const leaveRequestId = req.params.id as string;
    const updated = await approveLeave(leaveRequestId, req.user!.id, scopeFor(req));
    if (!updated) {
        res.status(404).json({ message: 'Leave request not found', payload: null });
        return;
    }
    res.status(200).json({ message: 'Leave approved', payload: updated });
};

export const rejectLeaveRequest = async (req: AuthRequest, res: Response): Promise<void> => {
    if (!ensureAdmin(req, res)) return;
    const leaveRequestId = req.params.id as string;
    const { rejectionReason } = req.body;
    if (!rejectionReason) {
        res.status(400).json({ message: 'rejectionReason is required', payload: null });
        return;
    }
    const updated = await rejectLeave(leaveRequestId, req.user!.id, rejectionReason, scopeFor(req));
    if (!updated) {
        res.status(404).json({ message: 'Leave request not found', payload: null });
        return;
    }
    res.status(200).json({ message: 'Leave rejected', payload: updated });
};
