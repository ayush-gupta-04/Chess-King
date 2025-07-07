'use client'

import type React from "react";
import { GetInitialPieceMap, isLight, mapFenToBoard } from "../../utils/helper-functions";
import { memo, useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { SignalingManager } from "../../utils/Signalling-Manager";
import { ERROR_CODE, GAME_OVER_REASON, USER_TYPE } from "@/utils/types/types";
import { redirect } from "next/navigation";

const ReadonlyChessBoard = memo( ( {gameId ,userId } : {userId : string,gameId : number }) => {
    const initialMappedPieces : Record<string,string> = GetInitialPieceMap();
    const [position,setPosition] = useState<Record<string,string>>(initialMappedPieces);
    const[clock ,setClock] = useState<{w_t : number , b_t : number}>({
        w_t : 0,
        b_t : 0
    })
    const[endGame , setEndGame] = useState<{
        reason : GAME_OVER_REASON,
        w? : string,
        l? : string
    } | null>(null);
    const whiteIntRef = useRef<NodeJS.Timeout | null>(null);
    const blackIntRef = useRef<NodeJS.Timeout | null>(null);
    const[playersData , setPlayersData] = useState<{
        fen : string,
        w_name? : string,
        w_rating? : number,
        b_name? : string,
        b_rating? : number,
        w_time? : number,
        b_time? : number
    } | null>(null);

    const ranks = ['8','7','6','5','4','3','2','1'];
    const files = ['a','b','c','d','e','f','g','h'];
    const board : string[][] = ranks.map(r => files.map(f => `${f}${r}`));

    //this chess reference will not change across re-renders.
    const chess = useRef(new Chess());

    useEffect(() => {
        //register a Piece move.
        SignalingManager.getInstance(userId).registerCallback('MOVE_ADDED',(data : {
                from : string,
                to : string,
                w_t : number,
                b_t : number,
                turn : 'w' | 'b'
            }) => {

            if(!data.from || data.from === data.to){
                return;
            }
            try{
                if(position[data.from] != null){
                    setPosition((position) => {
                        const piece = position[data.from];
                        if(!piece){
                            return position;
                        }
                        const newPosition = {...position};
                        delete newPosition[data.from];
                        newPosition[data.to] = piece;
                        return newPosition;
                    })
                }
                setClock(c => {
                    const newClock = {...c};
                    newClock.b_t = data.b_t;
                    newClock.w_t = data.w_t;
                    return newClock;
                })

                if(data.turn == 'w'){
                    if(whiteIntRef.current) clearInterval(whiteIntRef.current);
                    if(blackIntRef.current) clearInterval(blackIntRef.current);
                    whiteIntRef.current = setInterval(() => {
                        setClock(c => {
                            if(c.w_t > 0){
                                return { ...c, w_t: c.w_t - 1 }
                            }
                            return c;
                        });
                    }, 1000);
                }else{
                    if (whiteIntRef.current) clearInterval(whiteIntRef.current);
                    if (blackIntRef.current) clearInterval(blackIntRef.current);

                     blackIntRef.current = setInterval(() => {
                        setClock(c => {
                            if(c.b_t > 0){
                                return { ...c, b_t: c.b_t - 1 }
                            }
                            return c;
                            
                        });
                    }, 1000);
                }

                chess.current.move({from : data.from, to: data.to});

                
            }catch (err) {
                console.log(err)
            }
        },'11')


        //rgister join_game logic.
        SignalingManager.getInstance(userId).registerCallback('BOARD_SYNCED', (data : {
            fen : string,
            color? : 'w' | 'b',
            w_name? : string,
            w_rating? : number,
            b_name? : string,
            b_rating? : number,
            w_time? : number,
            b_time? : number,
            turn : 'w' | 'b'
        }) => {
                const fen = data.fen;
                //i need to load my chess instancee with this fen.
                chess.current.load(fen);

                //i need to set the initial position according to this new fen.
                setTimeout(() => {
                    setPosition(() => {
                        const newPosition = mapFenToBoard(fen);
                        return newPosition;
                    })
                    setPlayersData(data);
                }, 1000);
                setClock(c => {
                    const newClock = {...c};
                    newClock.b_t = data.b_time || 0,
                    newClock.w_t = data.w_time || 0
                    return newClock;
                })
                if(data.turn == 'w'){
                    if (blackIntRef.current) clearInterval(blackIntRef.current);
                    if (whiteIntRef.current) clearInterval(whiteIntRef.current);

                    whiteIntRef.current = setInterval(() => {
                        setClock(c => {
                            if(c.w_t > 0){
                                return { ...c, w_t: c.w_t - 1 }
                            }
                            return c;
                        });
                    }, 1000);
                }else{
                    if (whiteIntRef.current) clearInterval(whiteIntRef.current);
                    if (blackIntRef.current) clearInterval(blackIntRef.current);

                    blackIntRef.current = setInterval(() => {
                        setClock(c => {
                            if(c.b_t > 0){
                                return { ...c, b_t: c.b_t - 1 }
                            }
                            return c;
                            
                        });
                    }, 1000);
                }
        },'12')


        SignalingManager.getInstance(userId).registerCallback('ERROR',(data : {
            code : ERROR_CODE
        }) => {
            switch(data.code){
                case ERROR_CODE.GAME_NOT_FOUND : 
                    redirect('/home');
                break;
                case ERROR_CODE.GAME_NOT_STARTED : 
                    redirect('/home');
                break;
            }
        },'13')

        SignalingManager.getInstance(userId).registerCallback('GAME_OVER', (data : {
            reason : GAME_OVER_REASON,
            w? : 'w' | 'b',
            l? : 'w' | 'b',
        }) => {
            switch(data.reason){
                case GAME_OVER_REASON.TIMEOUT : 
                    setEndGame({
                        reason : data.reason,
                        w : data.w ,
                        l : data.l
                    })
                break;
                case GAME_OVER_REASON.CHECKMATE : 
                    setEndGame({
                        reason : data.reason,
                        w : data.w ,
                        l : data.l 
                    })
                break;
                case GAME_OVER_REASON.DRAW : 
                    setEndGame({
                        reason : data.reason
                    })
                break;
            }
        },'14')


        SignalingManager.getInstance(userId).sendMessage({
            type : 'SYNC_BOARD',
            data : {
                gameId : gameId,
                user : USER_TYPE.SPECTATOR
            }
        })


        return () => {
            SignalingManager.getInstance(userId).deRegisterCallback('MOVE_ADDED','11');
            SignalingManager.getInstance(userId).deRegisterCallback('BOARD_SYNCED','12');
            SignalingManager.getInstance(userId).deRegisterCallback('ERROR','13');
            SignalingManager.getInstance(userId).deRegisterCallback('GAME_OVER,','14');
            if (whiteIntRef.current) clearInterval(whiteIntRef.current);
            if (blackIntRef.current) clearInterval(blackIntRef.current);
        }
    },[])


    return (
        <div className="flex-1 flex-col flex justify-center items-center">
            {endGame != null && 
                <Popup reason={endGame.reason} w_name={endGame.w == 'w' ? playersData?.w_name : playersData?.b_name} l_name={endGame.l == 'w' ? playersData?.w_name : playersData?.b_name}></Popup>
            }
            {endGame != null && 
                <Background></Background>
            }
            <div className="flex flex-row justify-between w-[480px] md:w-[576px] lg:w-[680px] ">
                <div className="flex flex-col py-1 text-white font-semibold">
                    <div className="flex gap-2">Name : <div>{playersData?.b_name}</div></div>
                    <div className="flex gap-2">Rating : <div>{playersData?.b_rating}</div></div>
                </div>
                <div className="text-2xl text-white font-semibold tracking-wider">
                    {
                        (() => {
                        const time = clock.b_t
                        const minutes = String(Math.floor(time / 60)).padStart(2, '0');
                        const seconds = String(time % 60).padStart(2, '0');
                        return `${minutes}:${seconds}`;
                        })()
                    }
                </div>
            </div>
            <div className="bg-white size-[480px] md:size-[576px] lg:size-[680px] grid grid-cols-8 place-items-center">
                {board.map(arr => arr.map(coordinate => {
                    const isLightTile = isLight(coordinate);
                    const rank : string= coordinate.charAt(1);
                    const file : string= coordinate.charAt(0);
                    const pieceCode = position[coordinate];
                

                    return (
                        <div key = {coordinate} className={`${isLightTile ? "bg-light-tile text-dark-tile" : "bg-dark-tile text-light-tile"} h-full flex w-full p-1 font-semibold relative `} 
                            >
                            {rank == '1' && 
                                <div className="absolute bottom-1 right-1 " >{file}</div>
                            }
                            {file == 'a' && 
                                <div className="absolute top-1 left-1">{rank}</div>
                            }
                            {pieceCode && 
                                <img 
                                    src = {`/pieces/${pieceCode}.png`} 
                                    className={` z-10 bg-center size-full bg-cover absolute bg-no-repeat top-0 left-0 active:cursor-grabbing hover:cursor-grab object-containa`}  
                                ></img>
                            }
                        </div>
                    )   
                }))}
            </div>
            <div className="flex flex-row justify-between w-[480px] md:w-[576px] lg:w-[680px] ">
                <div className="flex flex-col py-1 text-white font-semibold">
                    <div className="flex gap-2">Name : <div>{playersData?.w_name }</div></div>
                    <div className="flex gap-2">Rating : <div>{playersData?.w_rating }</div></div>
                </div>
                <div className="text-2xl text-white font-semibold tracking-wider">
                    {
                        (() => {
                        const time = clock.w_t;
                        const minutes = String(Math.floor(time / 60)).padStart(2, '0');
                        const seconds = String(time % 60).padStart(2, '0');
                        return `${minutes}:${seconds}`;
                        })()
                    }
                </div>
            </div>
        </div>
    )
})


function Popup({
        reason,
        w_name,
        l_name
    } : {
        reason? : GAME_OVER_REASON,
        w_name? : string,
        l_name? : string
    }){
        console.log(w_name);
        console.log(reason);
    return (
        <div className="z-30 fixed top-1/2 left-1/2 transition-all -translate-x-1/2 -translate-y-1/2 h-fit w-5/6 md:w-1/2 lg:w-1/3 bg-base-black-00 shadow-lg rounded-lg">
            {reason == GAME_OVER_REASON.DRAW && 
                <div className="py-3 flex flex-col gap-2">
                    <div className="text-center text-2xl font-semibold text-white">Match Draw !</div>
                    <div className="text-center text-white">No one won !</div>
                    <div className="text-blue-300 text-lg text-center">Closing the game ! redirecting ...</div>
                </div>
            }
            {reason == GAME_OVER_REASON.TIMEOUT && 
                <div className="py-3 flex flex-col gap-2 px-2">
                    <div className="text-center text-2xl font-semibold text-white">Match Over !</div>
                    <div className="flex flex-row gap-2 bg-base-black-0 py-2 rounded-lg">
                        <div className="flex-1 text-center  text-white font-semibold text-xl">{w_name}</div>
                        <div>V/S</div>
                        <div className="flex-1 text-center  text-white font-semibold text-xl">{l_name}</div>
                    </div>
                    <div className="flex justify-center items-center gap-2 text-white text-lg">
                        <img src="/reward.svg" alt="" className="size-10 stroke-white"/>
                        <div>Winner is !</div>
                        <div className="text-center text-green-400/[50%] text-xl font-semibold">{w_name}</div>
                    </div>
                    
                </div>
            }
            {reason == GAME_OVER_REASON.CHECKMATE && 
                <div className="py-3 flex flex-col gap-2 px-2">
                    <div className="text-center text-2xl font-semibold text-white">Match Over !</div>
                    <div className="flex flex-row gap-2 bg-base-black-0 py-2 rounded-lg">
                        <div className="flex-1 text-center  text-white font-semibold text-xl">{w_name}</div>
                        <div>V/S</div>
                        <div className="flex-1 text-center  text-white font-semibold text-xl">{l_name}</div>
                    </div>
                    <div className="flex justify-center items-center gap-2 text-white text-lg">
                        <img src="/reward.svg" alt="" className="size-10 stroke-white"/>
                        <div>Winner is !</div>
                        <div className="text-center text-green-400/[50%] text-xl font-semibold">{w_name}</div>
                    </div>
                    
                </div>
            }
        </div>
    )
}


function Background(){
    return(
        <div className="h-screen w-screen fixed z-20 top-1/2 left-1/2 transition-all -translate-x-1/2 -translate-y-1/2 backdrop-brightness-75 pointer-events-none " onClick={e => e.stopPropagation()}></div>
    )
}

export default ReadonlyChessBoard;