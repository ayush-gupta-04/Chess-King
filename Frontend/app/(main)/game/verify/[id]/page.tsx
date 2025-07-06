
import { getUser } from "@/app/action/getUserInfo";
import Verify from "@/components/big/verify";

export default async  function VerifyPage({params} : {params : Promise<{id : string}>}){
    const {id} = await params;
    const user = await getUser();
    return (
        <div className="flex-1 flex justify-center items-center">
            <Verify userId = {user?.id} gameId = {parseInt(id)}></Verify>
        </div>
    )
}