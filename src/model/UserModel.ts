import { Schema, model } from 'mongoose';

const employeeSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, 
  employeeId: { type: String, required: true, unique: true }, 
  role: { 
    type: String, 
    enum: ['Admin', 'Employee'], 
    default: 'Employee' 
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

export const UserModel=model("Employee",employeeSchema)