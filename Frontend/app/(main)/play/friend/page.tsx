import { getUser } from "@/app/action/getUserInfo";
import StartGameFriend from "@/components/big/start-game-friend";
import FakeChessBoard from "@/components/board/fake-chess-board";

export default async function PlayOnline(){
    const user = await getUser();
    return (
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-6 overflow-auto" style={{scrollbarWidth : "none"}}>
            <div className="lg:col-span-4 bg-base-black-0 flex justify-center items-center flex-1 py-4">
                <FakeChessBoard></FakeChessBoard>
            </div>
            <div className="lg:col-span-2 bg-base-black-1 flex-1 flex gap-4 p-4 ">
                <StartGameFriend id = {user?.id} ></StartGameFriend>
            </div>
        </div>
    )
}
