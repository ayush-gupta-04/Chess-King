import { getUser } from "@/app/action/getUserInfo";
import Chat from "@/components/big/chat";
import Moves from "@/components/big/moves";
import ChessBoard from "@/components/board/chess-board";
import ReadonlyChessBoard from "@/components/board/readonly-chess-board";


export default async function Spectate({params} : {params : Promise<{id : string}>}){
    const {id} = await params;
    const user = await getUser();

    return (
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-6 overflow-auto" style={{scrollbarWidth : "none"}}>
            <div className="lg:col-span-4 bg-base-black-0 flex justify-center items-center flex-1 py-4">
                <ReadonlyChessBoard userId = {user?.id || ''} gameId = {parseInt(id)}></ReadonlyChessBoard>
            </div>
            <div className="lg:col-span-2 bg-base-black-1 flex flex-col gap-4 p-4 md:flex-row lg:flex-col">
                <Moves gameId = {parseInt(id)}  userId = {user?.id || ''}></Moves>   {/*done*/}
            </div>
        </div>
    )
}