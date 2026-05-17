import { Router } from "express";
import eah from 'express-async-handler'
import { verifyToken } from "../middleware/verifyToken";


export const empRouter = Router();
