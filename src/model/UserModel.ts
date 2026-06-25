import { Schema, model } from 'mongoose';

const employeeSchema = new Schema({
  name: { type: String, required: true, trim: true },
  // Globally unique: email is the login key across all tenants.
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  // Unique only within an organization (see compound index below), not globally.
  employeeId: { type: String, required: true, trim: true },
  role: {
    type: String,
    enum: ['SuperAdmin', 'Admin', 'Employee'],
    default: 'Employee'
  },
  // Tenant the user belongs to. Required for Admin/Employee; null for SuperAdmin.
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: function (this: any) { return this.role !== 'SuperAdmin'; }
  },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  joiningDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Active', 'On_Leave', 'Terminated'],
    default: 'Active'
  },

  leaveBalances: {
    sickLeave: { type: Number, default: 12 },
    casualLeave: { type: Number, default: 12 },
    paidTimeOff: { type: Number, default: 15 }
  }
}, { timestamps: true });

// employeeId is unique per tenant, so two customers can both use "EMP-001".
// Partial filter excludes SuperAdmins (no organization) from the constraint.
employeeSchema.index(
  { organization: 1, employeeId: 1 },
  { unique: true, partialFilterExpression: { organization: { $exists: true } } }
);

export const UserModel=model("Employee",employeeSchema)