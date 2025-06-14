'use client'

import type React from "react";
import { GetInitialPieceMap, isLight } from "../../../utils/helper-functions";
import { memo, useEffect, useRef, useState, type Dispatch } from "react";
import { Chess } from "chess.js";
import { SignalingManager } from "../../../utils/Signalling-Manager";

const ChessBoard = memo( ({setMoves , gameId ,id , token} : {token : string ,id : string,gameId : number ,setMoves : Dispatch<React.SetStateAction<string[]>>}) => {
    const initialMappedPieces : Record<string,string> = GetInitialPieceMap();
    const [position,setPosition] = useState<Record<string,string>>(initialMappedPieces);
    const[startPosition , setStartPosition] = useState<string | null>(null);
    const[playerColor , setPlayerColor] = useState<'w' | 'b'>('w');

    const ranks = playerColor == 'w' ? ['8','7','6','5','4','3','2','1'] : ['1','2','3','4','5','6','7','8'];
    const files = playerColor == 'w' ?  ['a','b','c','d','e','f','g','h'] : ['h','g','f','e','d','c','b','a'];
    const board : string[][] = ranks.map(r => files.map(f => `${f}${r}`));

    //this chess reference will not change across re-renders.
    const chess = useRef(new Chess());

    useEffect(() => {
        //register a Piece move
        SignalingManager.getInstance(token).registerCallback('PIECE_MOVE',(data : {from: string;to: string;}) => {
            if(!data.from || data.from === data.to){
                return;
            }
            try{
                console.log(data);
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
                setMoves((moves) => {
                    const newMoves = [...moves];
                    newMoves.push(data.to)
                    return newMoves;
                })
                setStartPosition(null);
                
            }catch (err) {
                console.log(err)
            }
        },'2')


        //rgister join_game logic.
        SignalingManager.getInstance(token).registerCallback('SYNCED_POSITION', (data : {fen : string , color : 'w' | 'b',history : string[]}) => {

            console.log(data)
            if(data){
                const fen = data.fen;

                //i need to load my chess instancee with this fen.
                chess.current.load(fen);

                //i need to set the initial position according to this new fen.
                setTimeout(() => {
                    setPosition(() => {
                    const [placement] = fen.split(' ');
                    const rows = placement.split('/');
                    const ranks = ['8','7','6','5','4','3','2','1'];
                    const files = ['a','b','c','d','e','f','g','h'];

                    const newPosition : Record<string,string> = {}

                    //it will loop from rank 8 to 1.
                    rows.forEach((rank,rankIndex) => {
                        let fileIndex = 0;


                        //for every character of row.
                        for(const char of rank){

                            //if an empty square..skip.
                            //Digit rpresents empty squares.
                            if(/\d/.test(char)){
                                fileIndex += parseInt(char);
                            }else{
                                const rank = ranks[rankIndex];
                                const file = files[fileIndex];
                                const isWhite = char === char.toUpperCase();
                                const pieceType = char.toLowerCase();
                                const coordinate = `${file}${rank}`;;
                                const piece = (isWhite ? 'w'  :'b' ) + pieceType;
                                newPosition[coordinate] = piece;
                                fileIndex++;
                            }
                        }
                    })

                    return newPosition;
                })
                    setPlayerColor(data.color);
                    setMoves((moves) => {
                        return data.history
                    })
                }, 1000);
            }
            console.log("After syncing !");
            console.log(chess.current.ascii());
        },'4')


        SignalingManager.getInstance(token).sendMessage({
            type : 'JOIN_GAME',
            data : {
                gameId : gameId
            }
        })

        return () => {
            SignalingManager.getInstance(token).deRegisterCallback('PIECE_MOVE','2');
            SignalingManager.getInstance(token).deRegisterCallback('SYNCED_POSITION','4');
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

        if(playerColor != chess.current.turn()){
            return;
        } 
        try {
            chess.current.move({from:startPosition,to : coordinate});
            const newPosition = {... position};
            delete newPosition[startPosition];
            newPosition[coordinate] = piece;
            setPosition(newPosition)
            setStartPosition(null);
            setMoves((moves) => {
                const newMoves = [...moves];
                newMoves.push(coordinate)
                return newMoves;
            })
            SignalingManager.getInstance(token).sendMessage({
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
        <div className="bg-white size-[480px] md:size-[576px] lg:size-[720px] grid grid-cols-8 place-items-center">
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
                        {rank == '1' && playerColor == 'w' &&
                            <div className="absolute bottom-1 right-1 " >{file}</div>
                        }
                        {file == 'a' && playerColor == 'w' && 
                            <div className="absolute top-1 left-1">{rank}</div>
                        }

                        {rank == '8' && playerColor == 'b' &&
                            <div className="absolute bottom-1 right-1 " >{file}</div>
                        }
                        {file == 'h' && playerColor == 'b' && 
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
    )
})



export default ChessBoard;