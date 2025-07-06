
'use client'
import { redirect, usePathname } from "next/navigation"

export default function SideBar(){
    const path = usePathname();
    return(
        <div className="h-full w-full bg-base-black-1 flex flex-col justify-center items-center px-4 text-white">
            <ul className="flex flex-col gap-2 w-full">
                <li className={`px-2 py-1 ${path == '/home' ? "bg-base-black-00 ":"hover:bg-base-black-00"} flex gap-2 rounded-lg cursor-pointer`} onClick={() => (redirect('/home'))}>
                    <img src="/home.svg" alt="home" className="size-10"/>
                    <span className="self-center">Home</span>
                </li>
                <li className={`px-2 py-1 ${path == '/play/online' ? "bg-base-black-00":"hover:bg-base-black-00"} flex gap-2 rounded-lg cursor-pointer`} onClick={() => (redirect('/play/online'))}>
                    <img src="/online.svg" alt="Play" className="size-10"/>
                    <span className="self-center">Play Online</span>
                </li>
                <li className={`px-2 py-1 ${path == '/play/bot' ? "bg-base-black-00":"hover:bg-base-black-00"} flex gap-2 rounded-lg cursor-pointer`} onClick={() => (redirect('/play/bot'))}>
                    <img src="/bot.svg" alt="Bot" className="size-10"/>
                    <span className="self-center">Play Bot</span>
                </li>
                <li className={`px-2 py-1 ${path == '/play/friend' ? "bg-base-black-00":"hover:bg-base-black-00"} flex gap-2 rounded-lg cursor-pointer`} onClick={() => (redirect('/play/friend'))}>
                    <img src="/friend.svg" alt="Friend" className="size-10"/>
                    <span className="self-center">Play Friend</span>
                </li>
                <li className={`px-2 py-1 ${path == '/game/history' ? "bg-base-black-00":"hover:bg-base-black-00"} flex gap-2 rounded-lg cursor-pointer`} onClick={() => (redirect('/game/history'))}>
                    <img src="/game.svg" alt="Game" className="size-10"/>
                    <span className="self-center">Game History</span>
                </li>
            </ul>
        </div>
    )
}