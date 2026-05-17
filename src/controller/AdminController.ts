import { Request , Response } from "express";
import {getAllEmployeesService} from '../services/AdminService'

export const getAllEmployees=async(req:Request,res:Response)=>{
    let employees=[]
    employees=await getAllEmployeesService()
    res.status(200).json({"message":"Here you go boss",payload:employees})
} 