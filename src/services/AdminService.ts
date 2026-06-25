import { LeaveRequestModel } from "../model/LeaveRequestModel";
import { UserModel } from "../model/UserModel";
import { createUser } from "./AuthService";
import { Role } from "../middleware/verifyToken";

// A null/undefined organization means "no tenant filter" — only SuperAdmin
// should ever pass that; Admins always pass their own org id.
type OrgScope = string | null | undefined;

const orgFilter = (organization: OrgScope) =>
    organization ? { organization } : {};

export const getAllEmployeesService = async (organization: OrgScope) => {
    return UserModel.find(orgFilter(organization)).select('-password');
};

export const viewLeaves = async (organization: OrgScope) => {
    return LeaveRequestModel.find(orgFilter(organization))
        .populate('employee', 'name email employeeId')
        .sort({ createdAt: -1 });
};

export const approveLeave = async (
    leaveRequestId: string,
    adminId: string,
    organization: OrgScope,
) => {
    // Scope the update to the admin's org so one tenant can't act on another's data.
    return LeaveRequestModel.findOneAndUpdate(
        { _id: leaveRequestId, ...orgFilter(organization) },
        { status: 'Approved', approvedBy: adminId },
        { new: true },
    );
};

export const rejectLeave = async (
    leaveRequestId: string,
    adminId: string,
    rejectionReason: string,
    organization: OrgScope,
) => {
    return LeaveRequestModel.findOneAndUpdate(
        { _id: leaveRequestId, ...orgFilter(organization) },
        { status: 'Rejected', approvedBy: adminId, rejectionReason },
        { new: true },
    );
};

/**
 * Create a user inside a specific organization. Only Admin/Employee can be
 * created this way — SuperAdmin is provisioned via the seed script only.
 */
export const createOrgUser = async (
    data: any,
    role: Role,
    organization: string,
) => {
    if (role !== 'Admin' && role !== 'Employee') {
        throw new Error('role must be either Admin or Employee');
    }
    if (!organization) {
        throw new Error('organization is required');
    }
    return createUser(data, { role, organization });
};
