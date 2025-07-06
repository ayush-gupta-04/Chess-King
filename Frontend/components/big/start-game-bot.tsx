'use client'
import { useEffect, useState } from "react";

export default function StartGameBot({id} : {id : string }){
    const[loading,setLoading] = useState(false);
    const[time, setTime] = useState<null | string>(null);
    const[response , setResponse] = useState<{success : boolean | null, message : string}>({success : null,message : ""});

    function startGame(){
        if(!time){
            setResponse({success : false,message : "Please Select a Time category !"})
        }
        setLoading(true);
        //make a ws request to initialte a game.
        setLoading(false);

    }

    useEffect(() => {
        // SignalingManager.getInstance(id).registerCallback('GAME_INITIALISED',(data : {success : boolean , data : {color : 'w'|'b' , gameId : number}}) => {
        //     if(data.success){
        //         setLoading(false);
        //         redirect(`/game/${data.data.gameId}`);
        //     }
        // },'1');

        // return () => {
        //     SignalingManager.getInstance(id).deRegisterCallback('GAME_INITIALISED','1');
        // }
    },[])
    return(
        <div className="lg:h-full h-[300px] w-full bg-base-black-2 rounded-lg text-white md:flex-1 gap-4 flex flex-col justify-center items-center px-4">
            <div className="flex flex-col w-full gap-2">
                <div className="self-star">Bulletz</div>
                <div className="flex flex-row gap-3 justify-around">
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" name={"cat"} value={"1+0"} className="peer hidden"  onChange={(e) => {setTime(e.target.value) ; setResponse({success : null,message : ''})}}/>
                        <div className="text-center h-full w-full rounded-lg bg-base-black-0 hover:bg-base-black-00 px-6 py-3 peer-checked:ring-2 peer-checked:ring-dark-tile">1 min</div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" name={"cat"} value={"1+1"} className="peer hidden"  onChange={(e) => {setTime(e.target.value); setResponse({success : null,message : ''})}}/>
                        <div className=" text-center h-full w-full rounded-lg bg-base-black-0 hover:bg-base-black-00 px-6 py-3 peer-checked:ring-2 peer-checked:ring-dark-tile">1/1</div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" name={"cat"} value={"2+1"} className="peer hidden"  onChange={(e) => {setTime(e.target.value); setResponse({success : null,message : ''})}}/>
                        <div className="text-center h-full w-full rounded-lg bg-base-black-0 hover:bg-base-black-00 px-6 py-3 peer-checked:ring-2 peer-checked:ring-dark-tile">2/1</div>
                    </label>
                </div>
            </div>
            <div className="flex flex-col w-full gap-2">
                <div className="self-star">Blitz</div>
                <div className="flex flex-row gap-3 justify-around">
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" name={"cat"} value={"3+0"} className="peer hidden"  onChange={(e) => {setTime(e.target.value); setResponse({success : null,message : ''})}}/>
                        <div className="text-center h-full w-full rounded-lg bg-base-black-0 hover:bg-base-black-00 px-6 py-3 peer-checked:ring-2 peer-checked:ring-dark-tile">3 min</div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" name={"cat"} value={"3+2"} className="peer hidden"  onChange={(e) => {setTime(e.target.value); setResponse({success : null,message : ''})}}/>
                        <div className=" text-center h-full w-full rounded-lg bg-base-black-0 hover:bg-base-black-00 px-6 py-3 peer-checked:ring-2 peer-checked:ring-dark-tile">3/2</div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" name={"cat"} value={"5+0"} className="peer hidden"  onChange={(e) => {setTime(e.target.value); setResponse({success : null,message : ''})}}/>
                        <div className="text-center h-full w-full rounded-lg bg-base-black-0 hover:bg-base-black-00 px-6 py-3 peer-checked:ring-2 peer-checked:ring-dark-tile">5 min</div>
                    </label>
                </div>
            </div>
            <div className="flex flex-col w-full gap-2">
                <div className="self-star">Rapid</div>
                <div className="flex flex-row gap-3 justify-around">
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" name={"cat"} value={"10+0"} className="peer hidden"  onChange={(e) => {setTime(e.target.value); setResponse({success : null,message : ''})}}/>
                        <div className="text-center h-full w-full rounded-lg bg-base-black-0 hover:bg-base-black-00 px-6 py-3 peer-checked:ring-2 peer-checked:ring-dark-tile">10 min</div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" name={"cat"} value={"10+5"} className="peer hidden"  onChange={(e) => {setTime(e.target.value); setResponse({success : null,message : ''})}}/>
                        <div className=" text-center h-full w-full rounded-lg bg-base-black-0 hover:bg-base-black-00 px-6 py-3 peer-checked:ring-2 peer-checked:ring-dark-tile">10/5</div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" name={"cat"} value={"15+0"} className="peer hidden"  onChange={(e) => {setTime(e.target.value); setResponse({success : null,message : ''})}}/>
                        <div className="text-center h-full w-full rounded-lg bg-base-black-0 hover:bg-base-black-00 px-6 py-3 peer-checked:ring-2 peer-checked:ring-dark-tile">15 min</div>
                    </label>
                </div>
            </div>
            {response.success != null && 
                <div className="w-full bg-base-black-0 py-4 text-center rounded-lg">{response.message}</div>
            }
            <button className="py-3 bg-dark-tile w-full rounded-lg hover:bg-dark-tile/[80%] font-semibold cursor-pointer"
                onClick={() => {startGame()}}
            >Play Bot</button>
        </div>
    )
}