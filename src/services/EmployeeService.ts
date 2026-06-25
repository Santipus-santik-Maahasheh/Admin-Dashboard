import { LeaveRequestModel } from "../model/LeaveRequestModel";
import { AttendanceModel } from "../model/AttendanceModel";

export const applyLeave = async (
    employeeId: string,
    organization: string,
    leaveData: any,
): Promise<any> => {
    if (!organization) {
        throw new Error('Employee is not associated with an organization');
    }
    if (!leaveData || typeof leaveData !== 'object') {
        throw new Error('Invalid leave data provided');
    }

    const { leaveType, startDate, endDate, reason, totalDays } = leaveData;
    if (!leaveType || !startDate || !endDate || !reason) {
        throw new Error('leaveType, startDate, endDate, and reason are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.valueOf()) || isNaN(end.valueOf()) || end < start) {
        throw new Error('Invalid leave dates');
    }

    const computedTotalDays = totalDays ?? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const leaveDoc = new LeaveRequestModel({
        ...leaveData,
        employee: employeeId,
        organization,
        startDate: start,
        endDate: end,
        totalDays: computedTotalDays,
    });

    return await leaveDoc.save();
};

export const viewLeave = async (employeeId: string): Promise<any[]> => {
    return await LeaveRequestModel.find({ employee: employeeId });
};

export const markAttendance = async (
    employeeId: string,
    organization: string,
    attendanceData: any,
): Promise<any> => {
    if (!organization) {
        throw new Error('Employee is not associated with an organization');
    }
    if (!attendanceData || typeof attendanceData !== 'object') {
        throw new Error('Invalid attendance data provided');
    }

    const { date, clockIn, clockOut, status } = attendanceData;
    const attendanceDate = date ? new Date(date) : new Date();
    if (isNaN(attendanceDate.valueOf())) {
        throw new Error('Invalid attendance date');
    }

    const normalizedDate = new Date(attendanceDate);
    normalizedDate.setHours(0, 0, 0, 0);

    const clockInDate = clockIn ? new Date(clockIn) : new Date();
    if (isNaN(clockInDate.valueOf())) {
        throw new Error('Invalid clockIn time');
    }

    let clockOutDate: Date | undefined;
    if (clockOut) {
        clockOutDate = new Date(clockOut);
        if (isNaN(clockOutDate.valueOf())) {
            throw new Error('Invalid clockOut time');
        }
        if (clockOutDate < clockInDate) {
            throw new Error('clockOut must be after clockIn');
        }
    }

    const workHours = clockOutDate ? (clockOutDate.getTime() - clockInDate.getTime()) / (1000 * 60 * 60) : 0;

    const existingRecord = await AttendanceModel.findOne({ employee: employeeId, date: normalizedDate });
    if (existingRecord) {
        existingRecord.clockIn = clockInDate;
        existingRecord.clockOut = clockOutDate;
        existingRecord.status = status || existingRecord.status;
        existingRecord.workHours = workHours;
        return await existingRecord.save();
    }

    const attendanceDoc = new AttendanceModel({
        employee: employeeId,
        organization,
        date: normalizedDate,
        clockIn: clockInDate,
        clockOut: clockOutDate,
        status: status || 'Present',
        workHours,
    });

    return await attendanceDoc.save();
};

export const viewAttendance = async (employeeId: string): Promise<any[]> => {
    return await AttendanceModel.find({ employee: employeeId }).sort({ date: -1 });
};