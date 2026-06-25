import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { registerOrganization, loginService } from '../services/AuthService';

/**
 * Public company signup: creates an Organization and its owner Admin in one call.
 * Role is decided server-side (always Admin here) — never read from client input.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    const { organizationName, admin } = req.body ?? {};

    if (!organizationName || !admin || !admin.email || !admin.name) {
        res.status(400).json({
            message: 'organizationName and admin (with name and email) are required',
            payload: null,
        });
        return;
    }

    const result = await registerOrganization({ organizationName, admin });
    res.status(201).json({
        message: 'Organization registered successfully',
        payload: result,
    });
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'email and password are required', payload: null });
        return;
    }

    const employee = await loginService(email, password);
    if (!employee) {
        res.status(403).json({ message: 'login failed', payload: null });
        return;
    }

    const secret = process.env.JWT_SECRET || 'secretkey';
    const token = jwt.sign(
        {
            id: employee._id || employee.id,
            role: employee.role,
            employeeId: employee.employeeId,
            organization: employee.organization ? String(employee.organization) : undefined,
        },
        secret,
        { expiresIn: '1h' }
    );

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
    });

    res.status(200).json({ message: 'login Success', payload: employee });
};
