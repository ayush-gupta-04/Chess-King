'use client'
import { SignalingManager } from "../../utils/Signalling-Manager";
import type { MessageToWebSocketServer } from "../../utils/types/types";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";

export default function StartGame({id , token} : {id : string ,token : string}){
    const[loading,setLoading] = useState(false);
    function startGame(){
        setLoading(true);
        const message : MessageToWebSocketServer = {
            type : "INITIALISE_GAME" 
        }
        SignalingManager.getInstance(token).sendMessage(message);
    }

    useEffect(() => {
        SignalingManager.getInstance(token).registerCallback('GAME_INITIALISED',(data : {success : boolean , data : {color : 'w'|'b' , gameId : number}}) => {
            if(data.success){
                setLoading(false);
                redirect(`/game/${data.data.gameId}`);
            }
        },'1');

        return () => {
            SignalingManager.getInstance(token).deRegisterCallback('GAME_INITIALISED','1');
        }
    },[])
    return(
        <div className="lg:h-full h-[300px] w-full bg-base-black-2 rounded-lg text-white md:flex-1 flex justify-center items-center">
            <button className="px-10 py-2 bg-green-button text-2xl rounded-lg hover:bg-green-button/[70%] hover:cursor-pointer" onClick={() => {
                startGame();
            }}>
                {loading ? "Loading..." : 'Start Game'}
            </button>
        </div>
    )
}