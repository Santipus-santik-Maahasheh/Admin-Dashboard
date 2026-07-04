import { Router } from "express";
import eah from "express-async-handler";
import { createEmployee, login } from "../controller/AuthController";

export const authRouter = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new employee
 *     description: Creates an employee. The password is hashed and never returned.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEmployeeInput'
 *     responses:
 *       201:
 *         description: Employee created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Employee created successfully }
 *                 employee: { $ref: '#/components/schemas/Employee' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
authRouter.post("/register", eah(createEmployee));

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in and receive an auth cookie
 *     description: >
 *       Validates credentials and, on success, sets an httpOnly `token` cookie
 *       containing the JWT used by all protected routes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login succeeded; `token` cookie is set
 *         headers:
 *           Set-Cookie:
 *             description: httpOnly JWT cookie
 *             schema: { type: string, example: 'token=eyJhbGci...; HttpOnly' }
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: login Success }
 *                 payload: { $ref: '#/components/schemas/Employee' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
authRouter.post("/login", eah(login));
