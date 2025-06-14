
import { getMyToken } from "@/app/action/getToken";
import { getUser } from "@/app/action/getUserInfo";
import CurrentGame from "@/components/game";

export default async function Game({params} : {params : Promise<{id : string}>}){
    const {id} = await params;
    const user = await getUser();
    const token = await getMyToken();
    return (
        <>
        <CurrentGame userName= {user?.name} userId = {user?.id} gameId = {parseInt(id)} token = {token}></CurrentGame>
        </>
    )
}