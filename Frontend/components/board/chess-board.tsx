'use client'

import type React from "react";
import { GetInitialPieceMap, isLight, mapFenToBoard } from "../../utils/helper-functions";
import { memo, useEffect, useRef, useState, type Dispatch } from "react";
import { Chess } from "chess.js";
import { SignalingManager } from "../../utils/Signalling-Manager";
import { ERROR_CODE, USER_TYPE } from "@/utils/types/types";
import { redirect } from "next/navigation";

const ChessBoard = memo( ( {gameId ,userId } : {userId : string,gameId : number }) => {
    const initialMappedPieces : Record<string,string> = GetInitialPieceMap();
    const [position,setPosition] = useState<Record<string,string>>(initialMappedPieces);
    const[startPosition , setStartPosition] = useState<string | null>(null);
    const[playersData , setPlayersData] = useState<{
        fen : string,
        color? : 'w' | 'b',
        w_name? : string,
        w_rating? : number,
        b_name? : string,
        b_rating? : number,
        w_time? : number,
        b_time? : number
    }>({
        fen : "",
        color : 'w'
    });

    console.log(playersData)

    const ranks = playersData.color == 'w' ? ['8','7','6','5','4','3','2','1'] : ['1','2','3','4','5','6','7','8'];
    const files = playersData.color == 'w' ?  ['a','b','c','d','e','f','g','h'] : ['h','g','f','e','d','c','b','a'];
    const board : string[][] = ranks.map(r => files.map(f => `${f}${r}`));

    //this chess reference will not change across re-renders.
    const chess = useRef(new Chess());

    useEffect(() => {
        //register a Piece move.
        SignalingManager.getInstance(userId).registerCallback('MOVE_ADDED',(data : {from: string;to: string;}) => {
            if(!data.from || data.from === data.to){
                return;
            }
            try{
                chess.current.move({from : data.from, to: data.to});
                
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
                setStartPosition(null);
                
            }catch (err) {
                console.log(err)
            }
        },'1')


        //rgister join_game logic.
        SignalingManager.getInstance(userId).registerCallback('BOARD_SYNCED', (data : {
            fen : string,
            color? : 'w' | 'b',
            w_name? : string,
            w_rating? : number,
            b_name? : string,
            b_rating? : number,
            w_time? : number,
            b_time? : number
        }) => {
            console.log(data)
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
        },'2')


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
        },'10')


        SignalingManager.getInstance(userId).sendMessage({
            type : 'SYNC_BOARD',
            data : {
                gameId : gameId,
                user : USER_TYPE.PLAYER
            }
        })


        return () => {
            SignalingManager.getInstance(userId).deRegisterCallback('MOVE_ADDED','1');
            SignalingManager.getInstance(userId).deRegisterCallback('BOARD_SYNCED','2');
            SignalingManager.getInstance(userId).deRegisterCallback('ERROR','10');
        }
    },[])

    function onDragStart(coordinate : string){
        setStartPosition(coordinate);
    }

    function onPieceDrop(coordinate : string){
        if(startPosition == null || startPosition == coordinate){
            return;
        }
        const piece = position[startPosition];
        if(!piece){
            return;
        }

        if(playersData.color != chess.current.turn()){
            return;
        } 
        try {
            chess.current.move({from:startPosition,to : coordinate});
            const newPosition = {... position};
            delete newPosition[startPosition];
            newPosition[coordinate] = piece;
            setPosition(newPosition)
            setStartPosition(null);
            SignalingManager.getInstance(userId).sendMessage({
                type : 'ADD_MOVE',
                data  : {
                    gameId : gameId,
                    from : startPosition,
                    to : coordinate
                }
            })
            console.log('I made a move');
            console.log(newPosition);
            console.log(chess.current.ascii());
        } catch (error) {
            console.log(error)
            return;
        }
    }
    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault(); // Needed to allow drop
    }


    return (
        <div className="flex-1 flex-col flex justify-center items-center">
            <div className="flex flex-row justify-between w-[480px] md:w-[576px] lg:w-[680px] ">
                <div className="flex flex-col py-1 text-white font-semibold">
                    <div className="flex gap-2">Name : <div>{playersData.color === 'w' ? playersData.b_name  :  playersData.w_name }</div></div>
                    <div className="flex gap-2">Rating : <div>{playersData.color === 'w' ? playersData.b_rating :  playersData.w_rating }</div></div>
                </div>
                <div>Clock</div>
            </div>
            <div className="bg-white size-[480px] md:size-[576px] lg:size-[680px] grid grid-cols-8 place-items-center">
                {board.map(arr => arr.map(coordinate => {
                    const isLightTile = isLight(coordinate);
                    const rank : string= coordinate.charAt(1);
                    const file : string= coordinate.charAt(0);
                    const pieceCode = position[coordinate];
                

                    return (
                        <div key = {coordinate} className={`${isLightTile ? "bg-light-tile text-dark-tile" : "bg-dark-tile text-light-tile"} h-full flex w-full p-1 font-semibold relative `} 
                            draggable = {false} 
                            onDrop={() => {onPieceDrop(coordinate)}} 
                            onDragOver={(e) => {handleDragOver(e)}} 
                            
                            >
                            {rank == '1' && playersData.color == 'w' &&
                                <div className="absolute bottom-1 right-1 " >{file}</div>
                            }
                            {file == 'a' && playersData.color == 'w' && 
                                <div className="absolute top-1 left-1">{rank}</div>
                            }

                            {rank == '8' && playersData.color == 'b' &&
                                <div className="absolute bottom-1 right-1 " >{file}</div>
                            }
                            {file == 'h' && playersData.color == 'b' && 
                                <div className="absolute top-1 left-1">{rank}</div>
                            }
                            {pieceCode && 
                                <img 
                                    src = {`/pieces/${pieceCode}.png`} 
                                    className={` z-10 bg-center size-full bg-cover absolute bg-no-repeat top-0 left-0 active:cursor-grabbing hover:cursor-grab object-containa`} 
                                    draggable = {true} 
                                    onDragStart={() => {
                                        onDragStart(coordinate);
                                    }}
                                    
                                ></img>
                            }
                        </div>
                    )   
                }))}
            </div>
            <div className="flex flex-row justify-between w-[480px] md:w-[576px] lg:w-[680px] ">
                <div className="flex flex-col py-1 text-white font-semibold">
                    <div className="flex gap-2">Name : <div>{playersData.color === 'b' ? playersData.b_name  :  playersData.w_name }</div></div>
                    <div className="flex gap-2">Rating : <div>{playersData.color === 'b' ? playersData.b_rating :  playersData.w_rating }</div></div>
                </div>
                <div>Clock</div>
            </div>
        </div>
    )
})



export default ChessBoard;