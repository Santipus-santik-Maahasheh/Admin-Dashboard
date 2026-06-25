import { Router } from "express";
import eah from 'express-async-handler'
import { verifyToken } from "../middleware/verifyToken";
import {
    getAllEmployees,
    createEmployee,
    viewAllLeaveRequests,
    approveLeaveRequest,
    rejectLeaveRequest,
} from "../controller/AdminController";

export const adminRouter=Router()

/**
 * @openapi
 * /admin/employees:
 *   get:
 *     tags: [Admin]
 *     summary: List all employees
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Employees retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Employee' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
adminRouter.get('/employees', verifyToken, eah(getAllEmployees));

/**
 * @openapi
 * /admin/employees:
 *   post:
 *     tags: [Admin]
 *     summary: Create a user within the organization
 *     description: >
 *       Admins create users (Employee or Admin) within their own organization.
 *       A SuperAdmin must specify the target `organization`. The role is taken
 *       from the body but restricted to Admin/Employee (SuperAdmin cannot be
 *       created here).
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserInput'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     payload: { $ref: '#/components/schemas/Employee' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
adminRouter.post('/employees', verifyToken, eah(createEmployee));

/**
 * @openapi
 * /admin/leaves:
 *   get:
 *     tags: [Admin]
 *     summary: View all leave requests
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Leave requests retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/LeaveRequest' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
adminRouter.get('/leaves', verifyToken, eah(viewAllLeaveRequests));

/**
 * @openapi
 * /admin/leaves/{id}/approve:
 *   patch:
 *     tags: [Admin]
 *     summary: Approve a leave request
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Leave request ObjectId
 *     responses:
 *       200:
 *         description: Leave approved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     payload: { $ref: '#/components/schemas/LeaveRequest' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
adminRouter.patch('/leaves/:id/approve', verifyToken, eah(approveLeaveRequest));

/**
 * @openapi
 * /admin/leaves/{id}/reject:
 *   patch:
 *     tags: [Admin]
 *     summary: Reject a leave request
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Leave request ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectLeaveInput'
 *     responses:
 *       200:
 *         description: Leave rejected
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     payload: { $ref: '#/components/schemas/LeaveRequest' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
adminRouter.patch('/leaves/:id/reject', verifyToken, eah(rejectLeaveRequest));