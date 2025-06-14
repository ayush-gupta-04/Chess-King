import jwt from "jsonwebtoken"
import { getUser } from "./getUserInfo";

export async function getMyToken(){
    const user = await getUser();
    const token = jwt.sign({id : user?.id , name : user?.name}, process.env.JWT_SECRET!);
    return token;
}