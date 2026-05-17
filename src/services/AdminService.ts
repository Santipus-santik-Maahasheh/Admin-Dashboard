import { UserModel } from "../model/UserModel";

export const getAllEmployeesService=async()=>{
    let emps=await UserModel.find()
    return emps
}
