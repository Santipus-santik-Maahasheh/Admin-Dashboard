import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/dbconfig';
import { UserModel } from '../model/UserModel';
import { createUser } from '../services/AuthService';

/**
 * One-off bootstrap: creates the platform SuperAdmin from environment variables.
 * SuperAdmin is never created through the public API — run this once after deploy.
 *
 *   SUPERADMIN_EMAIL=you@vendor.com SUPERADMIN_PASSWORD=... npm run seed:superadmin
 */
const seed = async (): Promise<void> => {
    const email = process.env.SUPERADMIN_EMAIL;
    const password = process.env.SUPERADMIN_PASSWORD;

    if (!email || !password) {
        console.error('❌ SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be set.');
        process.exit(1);
    }

    await connectDB();

    try {
        const existing = await UserModel.findOne({ role: 'SuperAdmin' });
        if (existing) {
            console.log(`ℹ️  A SuperAdmin already exists (${(existing as any).email}). Skipping.`);
            return;
        }

        const superAdmin = await createUser(
            {
                name: process.env.SUPERADMIN_NAME || 'Super Admin',
                email,
                password,
                employeeId: process.env.SUPERADMIN_EMPLOYEE_ID || 'SUPERADMIN',
                department: 'Platform',
                designation: 'Super Administrator',
                joiningDate: new Date(),
            },
            { role: 'SuperAdmin', organization: null },
        );

        console.log(`✅ SuperAdmin created: ${superAdmin.email}`);
    } catch (err: any) {
        console.error('💥 Failed to seed SuperAdmin:', err.message);
        process.exitCode = 1;
    } finally {
        await disconnectDB();
    }
};

seed();
