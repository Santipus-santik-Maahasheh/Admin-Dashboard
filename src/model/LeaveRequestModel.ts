import { Schema, model } from 'mongoose';

const leaveRequestSchema = new Schema({
  employee: { 
    type: Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
  },
  leaveType: { 
    type: String, 
    enum: ['Sick', 'Casual', 'PTO', 'Unpaid'], 
    required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalDays: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  approvedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'Employee' 
  },
  rejectionReason: { type: String }
}, { timestamps: true });

export const LeaveRequestModel=model('leaveRequest',leaveRequestSchema)