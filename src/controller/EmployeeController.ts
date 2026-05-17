import { Request, Response } from "express";
import { EmployeeCreation } from '../services/EmployeeService';

export const createEmployee = async (req: Request, res: Response): Promise<void> => {
    const empDetails = req.body;

    if (!empDetails || !empDetails.email || !empDetails.name) {
        throw new Error("Email and name are required");
    }  
    const employee = await EmployeeCreation(empDetails); 
    res.status(201).json({ 
        message: "Employee created successfully", 
        employee 
    });
};