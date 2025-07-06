'use client'
import { memo, useEffect, useRef, useState } from "react"
import { SignalingManager } from "../../utils/Signalling-Manager";
import { MESSAGE } from "@/utils/types/types";

const  Chat = memo(({gameId ,userId} : { gameId : number,userId : string}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [input,setInput] = useState('');
    const[messages , setMessages] = useState<MESSAGE[]>([]);

    useEffect(( )=> {
        if(scrollRef.current){
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    },[messages])


    useEffect(() => {
        //it will sync the messages.
        SignalingManager.getInstance(userId).registerCallback("MESSAGE_SYNCED", (data : { messages : MESSAGE[] }) => {
            setMessages((m) => {
                return data.messages; 
            })
        },'5')

        SignalingManager.getInstance(userId).registerCallback('MESSAGE' , ( data : { message : MESSAGE }) => {
            setMessages((m) => {
                const newMessage = [...m];
                newMessage.push(data.message)
                return newMessage;
            })
        },'6')


        SignalingManager.getInstance(userId).sendMessage({
            type : "SYNC_MESSAGE",
            data : {
                gameId : gameId
            }
        })
        
        return () => {
            SignalingManager.getInstance(userId).deRegisterCallback("MESSAGE_SYNCED",'5');
            SignalingManager.getInstance(userId).deRegisterCallback('MESSAGE','6');
        }
    },[])

    function clickHandler(message : string){
        //send the message to all players.
        SignalingManager.getInstance(userId).sendMessage({
            type : 'SEND_MESSAGE',
            data : {
                gameId : gameId ,
                message : message,
            }
        })
    }

    return(
        <div className="h-[385px] w-full bg-base-black-2 rounded-lg text-white flex flex-col">
            <div className="w-full h-fit bg-base-black-0 text-2xl text-center py-1 rounded-t-lg border-1 border-base-black-1">
                Chat Box
            </div>
            <div ref = {scrollRef} className="flex-1 overflow-auto px-2 flex flex-col gap-2" style={{scrollbarWidth : "none" , scrollBehavior : "smooth" , scrollSnapAlign : "start"}}>
                {messages.map((m,index) => {
                    return (
                        <div key={index} className="flex justify-between">
                            <div className="text-gray-200 bg-[#4e5d648c] place-content-center rounded-lg px-2 text-wrap max-w-52">{m.message}</div>
                            <div className="flex flex-col items-end">
                                <div className="text-gray-300 text-sm">{m.from}</div>
                            </div>
                        </div>
                    )
                })}
            </div>
            <form className="py-2 flex px-2 gap-2" onSubmit={(e) => {clickHandler(input);e.preventDefault() }}>
                <input onChange={(e => {setInput(e.target.value)})} type="text" placeholder="Type here.." className="px-2 py-1 text-lg w-full focus:ring-2 focus:ring-green-400  focus:outline-hidden rounded-lg bg-base-black-0 ring-1 ring-gray-600" />    
                <button className="rounded-full bg-green-400">Send</button>
            </form>  
        </div>
    )
})

export default Chat;