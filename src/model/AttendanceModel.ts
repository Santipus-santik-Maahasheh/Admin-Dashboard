import { Schema, model } from 'mongoose';

const attendanceSchema = new Schema({
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
  date: { 
    type: Date, 
    required: true 
  },
  clockIn: { type: Date, required: true },
  clockOut: { type: Date }, 
  status: { 
    type: String, 
    enum: ['Present', 'Absent', 'Late', 'Half_Day'], 
    default: 'Present' 
  },
  workHours: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export const AttendanceModel=model('Attendance',attendanceSchema)
