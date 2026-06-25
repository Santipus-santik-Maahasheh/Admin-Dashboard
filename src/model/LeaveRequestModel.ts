import { Schema, model } from 'mongoose';

const leaveRequestSchema = new Schema({
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  // Denormalized tenant id so admin queries can scope by org without a join.
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
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

// Common admin access pattern: leaves for an org, filtered/sorted by status.
leaveRequestSchema.index({ organization: 1, status: 1 });

export const LeaveRequestModel=model('LeaveRequest',leaveRequestSchema)