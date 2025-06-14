'use client'
import { useEffect, useRef } from "react";
export default function Moves({moves , gameId} : {moves  : string[] , gameId : number}){

    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(()=> {
        if(scrollRef.current){
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    },[moves])
    return(
        <div className="h-[385px] w-full bg-base-black-2 rounded-lg text-white  flex flex-col ">
            <div className="w-full rounded-t-lg h-fit bg-base-black-0 border-2 border-base-black-1 text-center py-1 text-2xl">
                Moves
            </div>  
            <div className="overflow-auto felx-1 px-4 py-2" style={{scrollbarWidth  : "none"}} ref = {scrollRef}>
                    {moves.map((move,index) => {
                        return (
                            <div key={index} className={`border-b-1 border-b-base-black-0 hover:bg-base-black-1 flex h-8 px-2 flex-row justify-between gap-2`}>
                                <div className="flex gap-4">
                                    <div className="text-gray-600">{index + 1}.</div>
                                    <div>{move}</div>
                                </div>
                                <div className="text-gray-500">{index%2 == 0 ? "White " : "Black"}</div>
                            </div>
                        )
                    })}
            </div>
        </div>
    )
}