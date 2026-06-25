import bcrypt from 'bcrypt';
import { UserModel } from '../model/UserModel';
import { OrganizationModel } from '../model/OrganizationModel';
import { Role } from '../middleware/verifyToken';

const SALT_ROUNDS = 10;

const slugify = (s: string): string =>
    String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const stripPassword = (doc: any): any => {
    const obj = typeof doc?.toObject === 'function' ? doc.toObject() : doc;
    const { password, ...rest } = obj;
    return rest;
};

/**
 * Low-level user creation. Role and organization are set by the CALLER, never
 * taken from raw client input, so public input can't grant itself privileges.
 */
export const createUser = async (
    data: any,
    opts: { role: Role; organization?: string | null },
): Promise<any> => {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid user data provided');
    }

    const { name, email, password, employeeId, department, designation, joiningDate } = data;
    if (!name || !email || !password || !employeeId || !department || !designation || !joiningDate) {
        throw new Error(
            'name, email, password, employeeId, department, designation and joiningDate are required',
        );
    }

    const existingUser = await UserModel.findOne({ email: String(email).toLowerCase() });
    if (existingUser) {
        throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const userDoc = new UserModel({
        name,
        email,
        employeeId,
        department,
        designation,
        joiningDate,
        leaveBalances: data.leaveBalances,
        password: hashedPassword,
        role: opts.role,
        organization: opts.organization ?? undefined,
    });

    const saved = await userDoc.save();
    return stripPassword(saved);
};

/**
 * Public company signup: creates a new Organization (tenant) and its owner Admin.
 * The role is forced to 'Admin' here, so clients cannot self-assign SuperAdmin.
 */
export const registerOrganization = async (data: any): Promise<any> => {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid signup data provided');
    }

    const { organizationName, admin } = data;
    if (!organizationName) {
        throw new Error('organizationName is required');
    }
    if (!admin || typeof admin !== 'object') {
        throw new Error('admin details are required');
    }

    const slug = slugify(organizationName);
    if (!slug) {
        throw new Error('organizationName must contain alphanumeric characters');
    }

    const existingOrg = await OrganizationModel.findOne({ slug });
    if (existingOrg) {
        throw new Error('An organization with a similar name already exists');
    }

    const org = await OrganizationModel.create({ name: organizationName, slug });
    try {
        const adminUser = await createUser(admin, { role: 'Admin', organization: org.id });
        org.set('owner', adminUser._id);
        await org.save();
        return { organization: org.toObject(), admin: adminUser };
    } catch (err) {
        // No multi-document transaction (standalone Mongo): roll back the org
        // if admin creation failed so we don't leave an orphan tenant.
        await OrganizationModel.deleteOne({ _id: org._id });
        throw err;
    }
};

/**
 * Login by email — the globally-unique key. (employeeId is only unique per org,
 * so it can't identify a user across tenants.)
 */
export const loginService = async (email: string, password: string) => {
    const user: any = await UserModel.findOne({ email: String(email).toLowerCase() });
    if (!user) {
        return null;
    }

    const check = await bcrypt.compare(password, user.password);
    if (!check) {
        return null;
    }

    return stripPassword(user);
};
