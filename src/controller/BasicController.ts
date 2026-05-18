import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { createEmployee as createEmployeeService, loginService } from '../services/BasicService';

export const createEmployee = async (req: Request, res: Response): Promise<void> => {
    const empDetails = req.body;

    if (!empDetails || !empDetails.email || !empDetails.name) {
        throw new Error("Email and name are required");
    }

    const employee = await createEmployeeService(empDetails);
    res.status(201).json({
        message: "Employee created successfully",
        employee
    });
};

export const login = async (req: Request, res: Response) => {
    const { employeeId, password } = req.body;
    if (!employeeId || !password) {
        return res.status(400).json({ message: 'employeeId and password are required', payload: null });
    }

    const employee = await loginService(employeeId, password);
    if (!employee) {
        return res.status(403).json({ message: 'login failed', payload: null });
    }

    const secret = process.env.JWT_SECRET || 'secretkey';
    const token = jwt.sign(
        { id: employee._id || employee.id, role: employee.role, employeeId: employee.employeeId },
        secret,
        { expiresIn: '1h' }
    );

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({ message: 'login Success', payload: employee });
};
