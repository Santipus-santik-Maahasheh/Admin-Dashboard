import bcrypt from 'bcrypt';
import { UserModel } from '../model/UserModel';

const SALT_ROUNDS = 10;

export const createEmployee = async (userData: any): Promise<any> => {
    if (!userData || typeof userData !== 'object') {
        throw new Error('Invalid user data provided');
    }

    if (!userData.password) {
        throw new Error('Password is required');
    }

    const existingUser = await UserModel.findOne({ email: userData.email });
    if (existingUser) {
        throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
    const userDoc = new UserModel({
        ...userData,
        password: hashedPassword,
    });

    const savedEmployee = await userDoc.save();
    const { password, ...employeeObject } = savedEmployee.toObject();
    return employeeObject;
};

export const loginService = async (employeeId: string, password: string) => {
    const employee: any = await UserModel.findOne({ employeeId });
    if (!employee) {
        return null;
    }

    const check = await bcrypt.compare(password, employee.password);
    if (!check) {
        return null;
    }

    const employeeObject = typeof employee.toObject === 'function' ? employee.toObject() : employee;
    const { password: _pwd, ...returnableEmployee } = employeeObject;
    return returnableEmployee;
};
