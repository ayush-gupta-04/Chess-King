'use client'
import { SignalingManager } from "@/utils/Signalling-Manager";
import { ERROR_CODE } from "@/utils/types/types";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function Verify({gameId , userId}: {gameId :number , userId : string}){
    const[input,setInput] = useState('');
    const[playerData , setPlayerData] = useState<{
        success : boolean,
        message : string,
        w_name : string,
        w_rating : number,
        b_name : string,
        b_rating : number
    } | null>(null)
    const[showPopup , setShowPopup] = useState(false);
    const[response,setResponse] = useState<{success : boolean | null , message : string}>({
        success : null,
        message : ''
    })
    const[loading,setLoading] = useState(false);


    useEffect(() => {
        SignalingManager.getInstance(userId).registerCallback('GAME_STARTED' , (data : {
            success : boolean,
            message : string,
            w_name : string,
            w_rating : number,
            b_name : string,
            b_rating : number
        }) => {
            if(data.success){
                setLoading(false);
                setShowPopup(true);
                setPlayerData(data);
                setTimeout(() => {
                    redirect(`/game/${gameId}`)
                }, 2000);
            }
        },'8')


        SignalingManager.getInstance(userId).registerCallback('ERROR', (data : {
            code : ERROR_CODE
        }) => {
            switch(data.code){
                case ERROR_CODE.GAME_ALREADY_STARTED : 
                    setResponse({success : false , message : "Game Already Started !"});
                break;
                case ERROR_CODE.GAME_CODE_WRONG : 
                    setResponse({success : false , message : "Wrong Code ! try again !"})
                break;
                case ERROR_CODE.GAME_NOT_FOUND : 
                    setResponse({success : false,message : "Game Not Found ! Check Link !"})
                break;
            }
            setLoading(false);
        },'8')

        return () => {
            SignalingManager.getInstance(userId).deRegisterCallback('GAME_STARTED','8');
            SignalingManager.getInstance(userId).deRegisterCallback('ERROR','8');
        }
    },[])
    function onClickHandler(){
        setLoading(true);
        SignalingManager.getInstance(userId).sendMessage({
            type : 'ADD_OTHER_PLAYER',
            data : {
                gameId : gameId,
                code : input
            }
        })
    }
    return (
        <div className="w-1/3 h-fit rounded-lg bg-base-black-1 px-4 py-4 gap-4 flex flex-col">
            {showPopup && 
                <Popup w_name ={playerData?.w_name} w_rating={playerData?.w_rating} b_name = {playerData?.b_name} b_rating={playerData?.b_rating}></Popup>
            }
            {showPopup &&
                <Background></Background>
            }
            <div className="text-center text-2xl text-gray-200">Enter Code to Join The Game</div>
            <input type='number' onChange={(e) => {setInput(e.target.value);setResponse({success : null,message : ''})}} className="no-spinner text-white text-xl  w-full px-4 font-semibold py-2 bg-base-black-2 rounded-lg focus:ring-2 focus:ring-dark-tile outline-hidden" />
            {response.success === false && 
                <div className="bg-red-400/[10%] py-2 rounded-lg text-start px-2 text-red-700 font-semibold">{response.message}</div>
            }
            <button onClick={() => {
                onClickHandler()
            }} className="w-full text-center py-2 bg-dark-tile rounded-lg hover:bg-dark-tile/[80%] cursor-pointer font-semibold">{loading ? "Loading..." : "Join Game"}</button>
        </div>
    )
}



function Popup({w_name,w_rating,b_name,b_rating} : {w_name? : string , w_rating?: number , b_name? : string, b_rating? : number}){
    return (
        <div className=" text-white flex flex-col justify-center gap-3 items-center px-4 py-4 w-5/6 md:w-1/2 lg:w-1/4 h-fit rounded-lg bg-base-black-00 fixed top-1/2 left-1/2 transition-all -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="text-3xl py-2 text-white">Initialising Match !</div>
            <div className="w-full rounded-lg bg-base-black-1 px-2 py-2">
                <label className="font-semibold">WHITE</label>
                <div className="flex justify-between items-center">
                    <div>{w_name}</div>
                    <div>
                        <div>Rating</div>
                        <div>{w_rating}</div>
                    </div>
                </div>
            </div>
            <div className="w-full rounded-lg bg-base-black-1 px-2 py-2">
                <label className="font-semibold">BLACK</label>
                <div className="flex justify-between items-center">
                    <div>{b_name}</div>
                    <div>
                        <div>Rating</div>
                        <div>{b_rating}</div>
                    </div>
                </div>
            </div>
            <div>Wait you will be redirected ! loading ...</div>
        </div>
    )
}

function Background(){
    return(
        <div className="h-screen w-screen fixed z-10 top-1/2 left-1/2 transition-all -translate-x-1/2 -translate-y-1/2 backdrop-brightness-75 pointer-events-none " onClick={e => e.stopPropagation()}></div>
    )
}