import { getMyToken } from "@/app/action/getToken";
import { getUser } from "@/app/action/getUserInfo";
import StartGame from "@/components/simple/start-game";
import FakeChessBoard from "@/components/ui/board/fake-chess-board";

export default async function PlayOnline(){
    const user = await getUser();
    const token = await getMyToken();

    return (
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-6 overflow-auto" style={{scrollbarWidth : "none"}}>
            <div className="lg:col-span-4 bg-base-black-0 flex justify-center items-center flex-1 py-4">
                <FakeChessBoard></FakeChessBoard>
            </div>
            <div className="lg:col-span-2 bg-base-black-1 flex-1 flex gap-4 p-4 ">
                <StartGame id = {user?.id} token = {token}></StartGame>
            </div>
        </div>
    )
}
