// types/employee.types.ts

export type Role = 'Admin' | 'Employee';
export type Status = 'Active' | 'On_Leave' | 'Terminated';

export interface LeaveBalances {
  sickLeave: number;
  casualLeave: number;
  paidTimeOff: number;
}

export interface Employee {
  _id: string;
  name: string;
  email: string;
  password: string;
  employeeId: string;
  role: Role;
  department: string;
  designation: string;
  joiningDate: Date | string;
  status: Status;
  leaveBalances: LeaveBalances;
  createdAt: string;
  updatedAt: string;
}

// For POST /employee (create) - all required fields, no _id or timestamps
export type CreateEmployeeDTO = Omit<Employee, '_id' | 'createdAt' | 'updatedAt'>;

// For PATCH /employee/:id (update) - everything optional
export type UpdateEmployeeDTO = Partial<Omit<Employee, '_id' | 'createdAt' | 'updatedAt'>>;