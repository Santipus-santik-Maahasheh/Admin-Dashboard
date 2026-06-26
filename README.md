# Admin Dashboard — Backend API

A **multi-tenant** REST API for a MERN admin dashboard covering employee
management, leave requests and attendance. Built with **TypeScript, Express and
Mongoose (MongoDB)**.

Authentication uses a stateless JWT carried in an **httpOnly cookie** named
`token`, issued by `POST /auth/login`. Interactive API docs are served from
**Swagger UI** at `/api-docs`.

---

## Tenancy model

Every customer company is one **Organization** (a tenant). All `Admin` and
`Employee` records, leave requests and attendance rows belong to exactly one
Organization. The platform operator (`SuperAdmin`) belongs to none and can act
across all tenants.

```
Organization (tenant)
 ├── Admin      (owns/manages the org)
 ├── Employee   (self-service: leave & attendance)
 └── Employee ...
SuperAdmin       (platform owner — no organization)
```

Tenant isolation is enforced in the data layer: admin queries are scoped to the
caller's `organization`, so one tenant can never read or mutate another tenant's
data. A `SuperAdmin` query passes no org filter and therefore sees everything.

---

## Roles & permissions

There are three roles (`UserModel.role`, enum `SuperAdmin | Admin | Employee`).
The role lives in the JWT and is **always assigned server-side** — it is never
read from raw client input, so a caller cannot escalate their own privileges.

| Role         | Belongs to an org? | How it's created                                  | Can do                                                                 |
| ------------ | ------------------ | ------------------------------------------------- | --------------------------------------------------------------------- |
| `SuperAdmin` | No (`null`)        | **Seed script only** (never via the API)          | Everything, across **all** organizations. Must name the target org when creating users. |
| `Admin`      | Yes                | Public company signup, or created by another Admin | Manage employees and leave **within their own org**; create `Admin`/`Employee` users. |
| `Employee`   | Yes                | Created by an Admin (default role)                 | Self-service only: apply for / view own leave, mark / view own attendance. |

How each role comes into existence:

- **SuperAdmin** — provisioned once via `npm run seed:superadmin` (see
  [Seeding](#seeding-the-superadmin)). The public API refuses to create one.
- **Admin** — created two ways:
  1. **Public company signup** (`POST /auth/register`) creates a new
     Organization plus its **owner Admin** in a single call. The role is forced
     to `Admin` server-side.
  2. An existing Admin (or SuperAdmin) creates additional Admins via
     `POST /admin/employees` with `role: "Admin"`.
- **Employee** — created by an Admin via `POST /admin/employees`. `role`
  defaults to `Employee`. Only `Admin`/`Employee` may be created this way —
  `SuperAdmin` is rejected.

Authorization is enforced by:

- **`verifyToken` middleware** — reads and verifies the JWT from the `token`
  cookie on every protected route; rejects with `401` if missing/invalid.
- **`ensureAdmin` guard** (in `AdminController`) — restricts the `/admin/*` area
  to `Admin` and `SuperAdmin`; returns `403` otherwise.
- **org scoping** — `Admin` callers are pinned to their own `organization`;
  `SuperAdmin` is unscoped.

---

## Tech stack

- **Runtime:** Node.js + TypeScript (`ts-node` / `nodemon` in dev)
- **Web:** Express 4
- **DB:** MongoDB via Mongoose 8
- **Auth:** `jsonwebtoken` (httpOnly cookie) + `bcrypt` password hashing
- **Docs:** `swagger-jsdoc` + `swagger-ui-express`
- **Hardening:** `helmet`, `cors` (credentials enabled), `cookie-parser`, `morgan` logging

---

## Prerequisites

- Node.js 18+ (project pins recent `@types/node`)
- A running MongoDB instance (local or remote)

---

## Installation & running

```bash
# 1. install dependencies
npm install

# 2. create your .env (see below), then start in watch mode
npm run dev
```

Once running, the server prints its URL and Swagger UI is available at
`http://localhost:<port>/api-docs`.

### npm scripts

| Script                     | Description                                              |
| -------------------------- | ------------------------------------------------------- |
| `npm run dev`              | Start with `nodemon` + `ts-node` (hot reload).          |
| `npm run build`            | Compile TypeScript to `dist/`.                          |
| `npm start`                | Run the compiled server (`node dist/index.js`).         |
| `npm run seed:superadmin`  | One-off: create the platform SuperAdmin (see below).    |

---

## Environment variables

Copy `.env.example` to `.env` and fill in real values. The variable names read
by the code are:

| Variable                 | Required | Used by                          | Description                                              |
| ------------------------ | -------- | -------------------------------- | -------------------------------------------------------- |
| `port`                   | yes      | server / swagger                 | HTTP port (e.g. `3000`).                                 |
| `mongodb_url`            | yes      | `dbconfig`                       | MongoDB connection string.                              |
| `JWT_SECRET`             | yes      | login / `verifyToken`            | Secret used to sign & verify JWTs. **Set this in prod.** |
| `NODE_ENV`               | no       | login cookie                     | When `production`, the auth cookie is sent `secure`.     |
| `SUPERADMIN_EMAIL`       | seed     | seed script                      | Email for the seeded SuperAdmin.                        |
| `SUPERADMIN_PASSWORD`    | seed     | seed script                      | Password for the seeded SuperAdmin.                    |
| `SUPERADMIN_NAME`        | no       | seed script                      | Defaults to `Super Admin`.                             |
| `SUPERADMIN_EMPLOYEE_ID` | no       | seed script                      | Defaults to `SUPERADMIN`.                              |

> **Note:** the JWT secret is read as `JWT_SECRET` (uppercase). If unset, the
> code falls back to the insecure default `secretkey` — always set a strong
> `JWT_SECRET` outside local development.

---

## Seeding the SuperAdmin

The `SuperAdmin` is the platform/vendor operator and is **never** created through
the public API. Provision it once after deploy with the seed script
(`src/scripts/seedSuperAdmin.ts`):

```bash
# values come from .env (or inline env vars)
SUPERADMIN_EMAIL=you@vendor.com \
SUPERADMIN_PASSWORD=ChangeMe! \
npm run seed:superadmin
```

What it does:

1. Requires `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD` (exits otherwise).
2. Connects to MongoDB.
3. **Idempotent:** if a `SuperAdmin` already exists, it logs and skips.
4. Otherwise creates the user via the same `createUser` service the API uses,
   with `role: 'SuperAdmin'` and `organization: null`, then disconnects.

All other users are seeded through normal flows:

- **First Admin of a tenant** → `POST /auth/register` (company signup).
- **Further Admins / Employees** → `POST /admin/employees`.

---

## Project structure

```
Admin-Dashboard/
├── src/
│   ├── index.ts                # App bootstrap, middleware, route mounting, graceful shutdown
│   ├── config/
│   │   ├── dbconfig.ts         # Mongo connect / disconnect helpers
│   │   └── swagger.ts          # OpenAPI 3 definition + schemas (source of API docs)
│   ├── routes/
│   │   ├── Auth.ts             # /auth/*    (register, login)
│   │   ├── Admin.ts            # /admin/*   (employees, leave management)
│   │   └── Employee.ts         # /employee/* (self-service leave & attendance)
│   ├── controller/             # Request/response handlers + role guards
│   │   ├── AuthController.ts
│   │   ├── AdminController.ts
│   │   └── EmployeeController.ts
│   ├── services/               # Business logic + DB access
│   │   ├── AuthService.ts      # createUser, registerOrganization, loginService
│   │   ├── AdminService.ts     # employee/leave queries (org-scoped)
│   │   └── EmployeeService.ts  # applyLeave, markAttendance, ...
│   ├── model/                  # Mongoose schemas
│   │   ├── UserModel.ts        # "Employee" collection (all roles)
│   │   ├── OrganizationModel.ts
│   │   ├── LeaveRequestModel.ts
│   │   └── AttendanceModel.ts
│   ├── middleware/
│   │   ├── verifyToken.ts      # JWT cookie auth + AuthRequest/Role types
│   │   └── errorHandler.ts
│   └── scripts/
│       └── seedSuperAdmin.ts   # One-off SuperAdmin bootstrap
├── .env.example
├── tsconfig.json
└── package.json
```

---

## Data models

**User** (`Employee` collection — stores all roles)
`name`, `email` *(globally unique, login key)*, `password` *(bcrypt)*,
`employeeId` *(unique **per org**)*, `role`, `organization` *(null for SuperAdmin)*,
`department`, `designation`, `joiningDate`,
`status` (`Active | On_Leave | Terminated`),
`leaveBalances` (`sickLeave` 12, `casualLeave` 12, `paidTimeOff` 15 by default).

> A compound partial index makes `employeeId` unique **within an organization**,
> so two tenants can both use `EMP-001`. SuperAdmins are excluded from this
> constraint.

**Organization** — `name`, `slug` *(unique, derived from name)*,
`status` (`Active | Suspended`), `owner` (the founding Admin).

**LeaveRequest** — `employee`, `organization`, `leaveType`
(`Sick | Casual | PTO | Unpaid`), `startDate`, `endDate`, `totalDays`
*(computed from the range if omitted)*, `reason`,
`status` (`Pending | Approved | Rejected`), `approvedBy`, `rejectionReason`.

**Attendance** — `employee`, `organization`, `date`, `clockIn`, `clockOut`,
`status` (`Present | Absent | Late | Half_Day`), `workHours`
*(computed from clock in/out)*. Unique per `(employee, date)`: marking the same
day **upserts** the existing record.

---

## API reference

Base URL: `http://localhost:<port>`. Interactive docs (with request/response
schemas and "Try it out"): **`/api-docs`** — raw spec at **`/api-docs.json`**.

All protected routes require the `token` cookie set by login. Responses use a
standard envelope: `{ message, payload }`.

### Auth — `/auth` (public)

| Method | Path             | Description                                                            |
| ------ | ---------------- | --------------------------------------------------------------------- |
| POST   | `/auth/register` | Company signup: creates an Organization **and** its owner Admin.      |
| POST   | `/auth/login`    | Validate credentials by email; on success sets the httpOnly `token` cookie. |

### Admin — `/admin` (requires `Admin` or `SuperAdmin`)

| Method | Path                        | Description                                                                 |
| ------ | --------------------------- | --------------------------------------------------------------------------- |
| GET    | `/admin/employees`          | List employees (own org for Admin; all orgs for SuperAdmin).                |
| POST   | `/admin/employees`          | Create a user (`role` defaults to `Employee`; Admin may also create Admin). SuperAdmin must supply `organization`. |
| GET    | `/admin/leaves`             | List leave requests (org-scoped).                                           |
| PATCH  | `/admin/leaves/{id}/approve`| Approve a leave request.                                                    |
| PATCH  | `/admin/leaves/{id}/reject` | Reject a leave request (requires `rejectionReason`).                        |

### Employee — `/employee` (requires authentication)

| Method | Path                       | Description                                                      |
| ------ | -------------------------- | -------------------------------------------------------------- |
| POST   | `/employee/leave/apply`    | Apply for leave (`totalDays` computed from the range if omitted). |
| GET    | `/employee/leave`          | View the caller's own leave requests.                          |
| POST   | `/employee/attendance`     | Mark/update today's attendance (upsert per day; defaults to now). |
| GET    | `/employee/attendance`     | View the caller's attendance history (newest first).          |

---

## Authentication flow

1. **Sign up a company** → `POST /auth/register` with `{ organizationName, admin }`.
   Creates the Organization and its owner `Admin`. (If admin creation fails, the
   org is rolled back so no orphan tenant remains.)
2. **Log in** → `POST /auth/login` with `{ email, password }`. On success a
   signed JWT (`id`, `role`, `employeeId`, `organization`) is set as an httpOnly,
   `sameSite=strict`, 1-hour cookie named `token`.
3. **Call protected routes** with that cookie. Send credentialed requests
   (`fetch(..., { credentials: 'include' })`); CORS is configured to allow them.

---

## License

MIT
