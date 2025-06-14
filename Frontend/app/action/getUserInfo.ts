'use server'
import { NEXT_AUTH } from "@/utils/auth";
import { getServerSession } from "next-auth";

export async function getUser(){
    const session = await getServerSession(NEXT_AUTH);
    if(session?.user){
        return {
            id : session.user.id,
            name : session.user.name,
        }
    }
    return null;
}