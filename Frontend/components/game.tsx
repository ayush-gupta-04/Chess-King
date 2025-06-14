'use client'

import { useState } from "react";
import Chat from "./simple/chat";
import Moves from "./simple/moves";
import ChessBoard from "./ui/board/chess-board";

export default function CurrentGame({userId, gameId ,userName,token} : {userName : string | undefined ,userId : string | undefined,gameId : number,token : string}){
    const[moves,setMoves] = useState<string[]>([]);
    return (
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-6 overflow-auto" style={{scrollbarWidth : "none"}}>
            <div className="lg:col-span-4 bg-base-black-0 flex justify-center items-center flex-1 py-4">
                <ChessBoard token = {token} id = {userId || ''} setMoves = {setMoves} gameId = {gameId}></ChessBoard>
            </div>
            <div className="lg:col-span-2 bg-base-black-1 flex flex-col gap-4 p-4 md:flex-row lg:flex-col">
                <Moves moves = {moves} gameId = {gameId}></Moves>
                <Chat token = {token} gameId = {gameId} userId = {userId || ''} userName ={userName || ''}></Chat>
            </div>
        </div>
    )
}