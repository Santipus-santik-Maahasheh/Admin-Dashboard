import { Router } from "express";
import eah from 'express-async-handler';
import { verifyToken } from "../middleware/verifyToken";
import { applyLeave, viewLeave, markAttendance, viewAttendance } from "../controller/EmployeeController";

export const empRouter = Router();

/**
 * @openapi
 * /employee/leave/apply:
 *   post:
 *     tags: [Employee]
 *     summary: Apply for leave
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplyLeaveInput'
 *     responses:
 *       201:
 *         description: Leave applied
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
 */
empRouter.post('/leave/apply', verifyToken, eah(applyLeave));

/**
 * @openapi
 * /employee/leave:
 *   get:
 *     tags: [Employee]
 *     summary: View the authenticated employee's leave requests
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
 */
empRouter.get('/leave', verifyToken, eah(viewLeave));

/**
 * @openapi
 * /employee/attendance:
 *   post:
 *     tags: [Employee]
 *     summary: Mark or update today's attendance
 *     description: Upserts the attendance record for the given day (defaults to now).
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MarkAttendanceInput'
 *     responses:
 *       201:
 *         description: Attendance recorded
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     payload: { $ref: '#/components/schemas/Attendance' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   get:
 *     tags: [Employee]
 *     summary: View the authenticated employee's attendance history
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Attendance retrieved (newest first)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Attendance' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
empRouter.post('/attendance', verifyToken, eah(markAttendance));
empRouter.get('/attendance', verifyToken, eah(viewAttendance));
