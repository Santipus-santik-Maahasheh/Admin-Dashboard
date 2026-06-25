import { Router } from "express";
import eah from "express-async-handler";
import { register, login } from "../controller/AuthController";

export const authRouter = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new organization (company signup)
 *     description: >
 *       Public endpoint that creates a new tenant (Organization) together with
 *       its owner Admin. The role is assigned server-side and cannot be set by
 *       the client. Use POST /admin/employees to add further users to the org.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompanySignupInput'
 *     responses:
 *       201:
 *         description: Organization and owner admin created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Organization registered successfully }
 *                 payload:
 *                   type: object
 *                   properties:
 *                     organization: { $ref: '#/components/schemas/Organization' }
 *                     admin: { $ref: '#/components/schemas/Employee' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
authRouter.post("/register", eah(register));

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in and receive an auth cookie
 *     description: >
 *       Validates credentials by email and, on success, sets an httpOnly `token`
 *       cookie containing the JWT used by all protected routes.
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
