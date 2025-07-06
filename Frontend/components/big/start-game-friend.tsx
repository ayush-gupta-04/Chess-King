'use client'
import { SignalingManager } from "@/utils/Signalling-Manager";
import { GameCategory, MatchType } from "@/utils/types/types";
import { redirect } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

export default function StartGameFriend({id} : {id : string }){
    const[loading,setLoading] = useState(false);
    const[category, setCategory] = useState<null | string>(null);
    const[response , setResponse] = useState<{success : boolean | null, message : string}>({success : null,message : ""});
    const[isPrivate,setIsPrivate] = useState(false);
    const codeRef = useRef<HTMLDivElement>(null);
    const linkRef = useRef<HTMLDivElement>(null);
    const[playersData,setPlayersData] = useState<{
        gameId : number,
        code? : string, 
        success : boolean,
        message : string,
        w_name? : string,
        w_rating? : number,
        b_name? : string,
        b_rating? : number
    } | null>(null);

    const[showPopup,setShowPopup] = useState(false);

    function startGame(){
        if(category == null){
            setResponse({success : false,message : "Please Select a Time category !"})
            return;
        }

        const type : string[] = category.split('.');
        const time = type[0];
        const cat = type[1];

        setLoading(true);
        SignalingManager.getInstance(id).sendMessage({
            type : 'INITIALISE_GAME',
            data : {
                category : cat as GameCategory,
                timeControl : time,
                isPublic : !isPrivate,
                matchType : MatchType.FRIEND
            }
        })

    }

    useEffect(() => {
        SignalingManager.getInstance(id).registerCallback('GAME_INITIALISED',(data : {
            gameId : number, //
            code? : string,   //
            success : boolean, //
            message : string,  //
            w_name? : string,
            w_rating? : number,
            b_name? : string,
            b_rating? : number
        }) => {
            if(data.success){
                setLoading(false);
                setPlayersData({
                    gameId : data.gameId,
                    code : data.code,
                    success : data.success,
                    message : data.message
                });
                setShowPopup(true);
            }
        },'7');

        return () => {
            SignalingManager.getInstance(id).deRegisterCallback('GAME_INITIALISED','7');
        }
    },[])
    return(
        <div className=" lg:h-full min-h-[300px] w-full bg-base-black-2 rounded-lg text-white md:flex-1 gap-4 flex flex-col justify-center items-center px-4">
            {showPopup && 
                <Popup setShowPopup={setShowPopup} gameId={playersData?.gameId} code={playersData?.code}></Popup>
            }
            {showPopup && 
                <Background></Background>
            }
            <div className="flex flex-col w-full gap-2">
                <div className="self-star">Bulletz</div>
                <div className="flex flex-row gap-3 justify-around">
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" name={"cat"} value={"1+0.bulletz"} className="peer hidden"  onChange={(e) => {setCategory(e.target.value) ; setResponse({success : null,message : ''})}}/>
                        <div className="text-center h-full w-full rounded-lg bg-base-black-0 hover:bg-base-black-00 px-6 py-3 peer-checked:ring-2 peer-checked:ring-dark-tile">1 min</div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" name={"cat"} value={"1+1.bulletz"} className="peer hidden"  onChange={(e) => {setCategory(e.target.value); setResponse({success : null,message : ''})}}/>
                        <div className=" text-center h-full w-full rounded-lg bg-base-black-0 hover:bg-base-black-00 px-6 py-3 peer-checked:ring-2 peer-checked:ring-dark-tile">1/1</div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" name={"cat"} value={"2+1.bulletz"} className="peer hidden"  onChange={(e) => {setCategory(e.target.value); setResponse({success : null,message : ''})}}/>
                        <div className="text-center h-full w-full rounded-lg bg-base-black-0 hover:bg-base-black-00 px-6 py-3 peer-checked:ring-2 peer-checked:ring-dark-tile">2/1</div>
                    </label>
                </div>
            </div>
            <div className="flex flex-col w-full gap-2">
                <div className="self-star">Blitz</div>
                <div className="flex flex-row gap-3 justify-around">
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" name={"cat"} value={"3+0.blitz"} className="peer hidden"  onChange={(e) => {setCategory(e.target.value); setResponse({success : null,message : ''})}}/>
                        <div className="text-center h-full w-full rounded-lg bg-base-black-0 hover:bg-base-black-00 px-6 py-3 peer-checked:ring-2 peer-checked:ring-dark-tile">3 min</div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" name={"cat"} value={"3+2.blitz"} className="peer hidden"  onChange={(e) => {setCategory(e.target.value); setResponse({success : null,message : ''})}}/>
                        <div className=" text-center h-full w-full rounded-lg bg-base-black-0 hover:bg-base-black-00 px-6 py-3 peer-checked:ring-2 peer-checked:ring-dark-tile">3/2</div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" name={"cat"} value={"5+0.blitz"} className="peer hidden"  onChange={(e) => {setCategory(e.target.value); setResponse({success : null,message : ''})}}/>
                        <div className="text-center h-full w-full rounded-lg bg-base-black-0 hover:bg-base-black-00 px-6 py-3 peer-checked:ring-2 peer-checked:ring-dark-tile">5 min</div>
                    </label>
                </div>
            </div>
            <div className="flex flex-col w-full gap-2">
                <div className="self-star">Rapid</div>
                <div className="flex flex-row gap-3 justify-around">
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" name={"cat"} value={"10+0.rapid"} className="peer hidden"  onChange={(e) => {setCategory(e.target.value); setResponse({success : null,message : ''})}}/>
                        <div className="text-center h-full w-full rounded-lg bg-base-black-0 hover:bg-base-black-00 px-6 py-3 peer-checked:ring-2 peer-checked:ring-dark-tile">10 min</div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" name={"cat"} value={"10+5.rapid"} className="peer hidden"  onChange={(e) => {setCategory(e.target.value); setResponse({success : null,message : ''})}}/>
                        <div className=" text-center h-full w-full rounded-lg bg-base-black-0 hover:bg-base-black-00 px-6 py-3 peer-checked:ring-2 peer-checked:ring-dark-tile">10/5</div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" name={"cat"} value={"15+0.rapid"} className="peer hidden"  onChange={(e) => {setCategory(e.target.value); setResponse({success : null,message : ''})}}/>
                        <div className="text-center h-full w-full rounded-lg bg-base-black-0 hover:bg-base-black-00 px-6 py-3 peer-checked:ring-2 peer-checked:ring-dark-tile">15 min</div>
                    </label>
                </div>
            </div>
            <label className="self-start cursor-pointer">
                <input type="radio" name={"private"} className="peer hidden"  onChange={(e) => {setIsPrivate(true)}}/>
                <div className="text-center h-full w-full rounded-lg bg-base-black-0 hover:bg-base-black-00 px-6 py-3 peer-checked:ring-2 peer-checked:ring-dark-tile">Keep Private</div>
            </label>
            {response.success != null && 
                <div className="w-full bg-base-black-0 py-4 text-center rounded-lg">{response.message}</div>
            }
            <button className="py-3 bg-dark-tile w-full rounded-lg hover:bg-dark-tile/[80%] font-semibold cursor-pointer"
                onClick={() => {startGame()}}
            >{loading ? "Loading..." : "Play Online"}</button>
        </div>
    )
}


function Popup({gameId , code ,setShowPopup} : {gameId? : number , code? : string , setShowPopup : Dispatch<SetStateAction<boolean>>}){
    
    return (
        <div className="flex flex-col justify-center gap-3 items-center px-4 py-4 w-5/6 md:w-1/2 lg:w-1/3 h-fit rounded-lg bg-base-black-00 fixed top-1/2 left-1/2 transition-all -translate-x-1/2 -translate-y-1/2 z-30">
            <div className="text-3xl py-2">Initiated Match !</div>
            <div className="w-full flex flex-col gap-2">
                <div className="w-full bg-base-black-1 px-4 py-3 rounded-lg flex justify-between">
                    <div>{`http://localhost:3000/game/verify/${gameId}`}</div>
                    <div className="text-green-600 cursor-pointer">copy</div>
                </div>
                <div className="w-full bg-base-black-1 px-4 py-3 rounded-lg flex justify-between">
                    <div className="flex gap-2">Code : <div className="text-blue-400">{code}</div></div>
                    <div className="text-green-600 cursor-pointer">copy</div>
                </div>
            </div>
            <div>Send This code and link to your friend !</div>
            <div className="flex gap-2 w-full">
                <div className="w-full text-base-black-2 font-semibold bg-gray-200 text-center py-2 rounded-lg hover:bg-gray-300 cursor-pointer " onClick={() => {setShowPopup(false)}}>close</div>
                <div className="w-full bg-dark-tile font-semibold text-center py-2 rounded-lg hover:bg-dark-tile/[80%] cursor-pointer " onClick={() => {redirect(`/game/${gameId}`)}}>Join Game</div>
            </div>
        </div>
    )
}

function Background(){
    return(
        <div className="h-screen w-screen fixed z-10 top-1/2 left-1/2 transition-all -translate-x-1/2 -translate-y-1/2 backdrop-brightness-75 pointer-events-none " onClick={e => e.stopPropagation()}></div>
    )
}