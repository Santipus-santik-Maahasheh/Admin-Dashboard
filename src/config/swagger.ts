import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';

const PORT = process.env.port || '3000';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Admin Dashboard API',
      version: '1.0.0',
      description:
        'REST API for the MERN admin dashboard: employee management, ' +
        'leave requests and attendance. Authentication uses an httpOnly ' +
        'JWT cookie named `token` issued by `POST /login`.',
    },
    servers: [{ url: `http://localhost:${PORT}`, description: 'Local server' }],
    tags: [
      { name: 'Auth', description: 'Registration and login' },
      { name: 'Employee', description: 'Employee self-service: leave & attendance' },
      { name: 'Admin', description: 'Admin-only employee and leave management' },
    ],
    components: {
      securitySchemes: {
        // Routes are protected by verifyToken, which reads the JWT from the `token` cookie.
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
      },
      schemas: {
        LeaveBalances: {
          type: 'object',
          properties: {
            sickLeave: { type: 'number', example: 12 },
            casualLeave: { type: 'number', example: 12 },
            paidTimeOff: { type: 'number', example: 15 },
          },
        },
        Organization: {
          type: 'object',
          description: 'A tenant. Each customer company is one Organization.',
          properties: {
            _id: { type: 'string', example: '6650f0a1b2c3d4e5f6a7b8c9' },
            name: { type: 'string', example: 'Acme Corp' },
            slug: { type: 'string', example: 'acme-corp' },
            status: { type: 'string', enum: ['Active', 'Suspended'], example: 'Active' },
            owner: { type: 'string', nullable: true, description: 'Owner Admin ObjectId' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Employee: {
          type: 'object',
          description: 'Employee record as returned by the API (password is never included).',
          properties: {
            _id: { type: 'string', example: '6650a1f2c3d4e5f6a7b8c9d0' },
            name: { type: 'string', example: 'Jane Doe' },
            email: { type: 'string', format: 'email', example: 'jane@company.com' },
            employeeId: { type: 'string', example: 'EMP-1001' },
            role: { type: 'string', enum: ['SuperAdmin', 'Admin', 'Employee'], example: 'Employee' },
            organization: {
              type: 'string',
              nullable: true,
              description: 'Organization ObjectId; null for SuperAdmin.',
            },
            department: { type: 'string', example: 'Engineering' },
            designation: { type: 'string', example: 'Backend Developer' },
            joiningDate: { type: 'string', format: 'date-time' },
            status: {
              type: 'string',
              enum: ['Active', 'On_Leave', 'Terminated'],
              example: 'Active',
            },
            leaveBalances: { $ref: '#/components/schemas/LeaveBalances' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        UserDetailsInput: {
          type: 'object',
          description: 'Common user fields. Role and organization are assigned server-side.',
          required: [
            'name',
            'email',
            'password',
            'employeeId',
            'department',
            'designation',
            'joiningDate',
          ],
          properties: {
            name: { type: 'string', example: 'Jane Doe' },
            email: { type: 'string', format: 'email', example: 'jane@company.com' },
            password: { type: 'string', format: 'password', example: 'S3curePass!' },
            employeeId: { type: 'string', example: 'EMP-1001' },
            department: { type: 'string', example: 'Engineering' },
            designation: { type: 'string', example: 'Backend Developer' },
            joiningDate: { type: 'string', format: 'date', example: '2024-01-15' },
            leaveBalances: { $ref: '#/components/schemas/LeaveBalances' },
          },
        },
        CompanySignupInput: {
          type: 'object',
          description: 'Public company signup: creates an Organization plus its owner Admin.',
          required: ['organizationName', 'admin'],
          properties: {
            organizationName: { type: 'string', example: 'Acme Corp' },
            admin: { $ref: '#/components/schemas/UserDetailsInput' },
          },
        },
        CreateUserInput: {
          type: 'object',
          description:
            'Admin-only user creation. role defaults to Employee; an Admin may also create Admins. ' +
            'organization is taken from the caller automatically (SuperAdmin must supply it).',
          allOf: [
            { $ref: '#/components/schemas/UserDetailsInput' },
            {
              type: 'object',
              properties: {
                role: { type: 'string', enum: ['Admin', 'Employee'], default: 'Employee' },
                organization: {
                  type: 'string',
                  description: 'Required only when the caller is a SuperAdmin.',
                },
              },
            },
          ],
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'jane@company.com' },
            password: { type: 'string', format: 'password', example: 'S3curePass!' },
          },
        },
        LeaveRequest: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '6650b2e3d4c5f6a7b8c9d0e1' },
            employee: { type: 'string', description: 'Employee ObjectId', example: '6650a1f2c3d4e5f6a7b8c9d0' },
            organization: { type: 'string', description: 'Organization ObjectId' },
            leaveType: { type: 'string', enum: ['Sick', 'Casual', 'PTO', 'Unpaid'] },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            totalDays: { type: 'number', example: 3 },
            reason: { type: 'string', example: 'Family function' },
            status: { type: 'string', enum: ['Pending', 'Approved', 'Rejected'], example: 'Pending' },
            approvedBy: { type: 'string', nullable: true, description: 'Admin ObjectId' },
            rejectionReason: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ApplyLeaveInput: {
          type: 'object',
          required: ['leaveType', 'startDate', 'endDate', 'reason'],
          properties: {
            leaveType: { type: 'string', enum: ['Sick', 'Casual', 'PTO', 'Unpaid'] },
            startDate: { type: 'string', format: 'date', example: '2026-07-01' },
            endDate: { type: 'string', format: 'date', example: '2026-07-03' },
            reason: { type: 'string', example: 'Family function' },
            totalDays: {
              type: 'number',
              description: 'Optional; computed from the date range when omitted.',
              example: 3,
            },
          },
        },
        RejectLeaveInput: {
          type: 'object',
          required: ['rejectionReason'],
          properties: {
            rejectionReason: { type: 'string', example: 'Insufficient leave balance' },
          },
        },
        Attendance: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '6650c3f4e5d6a7b8c9d0e1f2' },
            employee: { type: 'string', description: 'Employee ObjectId' },
            organization: { type: 'string', description: 'Organization ObjectId' },
            date: { type: 'string', format: 'date-time' },
            clockIn: { type: 'string', format: 'date-time' },
            clockOut: { type: 'string', format: 'date-time', nullable: true },
            status: {
              type: 'string',
              enum: ['Present', 'Absent', 'Late', 'Half_Day'],
              example: 'Present',
            },
            workHours: { type: 'number', example: 8 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        MarkAttendanceInput: {
          type: 'object',
          description:
            'All fields optional: date/clockIn default to now; existing record for the same day is updated.',
          properties: {
            date: { type: 'string', format: 'date', example: '2026-06-25' },
            clockIn: { type: 'string', format: 'date-time' },
            clockOut: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['Present', 'Absent', 'Late', 'Half_Day'] },
          },
        },
        ApiResponse: {
          type: 'object',
          description: 'Standard envelope: a human-readable message plus a payload.',
          properties: {
            message: { type: 'string' },
            payload: {},
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Invalid token' },
            payload: { nullable: true },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Missing or invalid authentication token',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        Forbidden: {
          description: 'Authenticated but not authorized (e.g. admin access required)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        BadRequest: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },
  // Route files own the @openapi path docs. Glob both .ts (ts-node dev) and
  // .js (compiled dist) so docs work in either mode. Normalize to forward
  // slashes: glob treats Windows backslashes as escape chars.
  apis: [path.join(__dirname, '../routes/*.{ts,js}').replace(/\\/g, '/')],
};

export const swaggerSpec = swaggerJSDoc(options);
