import { LeaveRequestModel } from "../model/LeaveRequestModel";
import { UserModel } from "../model/UserModel";

export const getAllEmployeesService=async()=>{
    let emps=await UserModel.find()
    return emps
}

export const approveLeave = async (leaveRequestId: string, employeeId: string) => {
    const updated = await LeaveRequestModel.findByIdAndUpdate(
        leaveRequestId,
        { status: 'Approved', approvedBy: employeeId },
        { new: true }
    );
    return updated;
};

export const rejectLeave = async (leaveRequestId: string, employeeId: string, rejectionReason: string) => {
    const updated = await LeaveRequestModel.findByIdAndUpdate(
        leaveRequestId,
        { status: 'Rejected', approvedBy: employeeId, rejectionReason },
        { new: true }
    );
    return updated;
};

export const viewLeaves = async () => {
    const leaves = await LeaveRequestModel.find();
    return leaves;
}