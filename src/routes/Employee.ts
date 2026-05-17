import { Router } from "express";
import eah from 'express-async-handler'
import { verifyToken } from "../middleware/verifyToken";


const empRouter = Router();


empRouter.post("/login", verifyToken, );
