'use client'
import { signIn, signOut } from "next-auth/react"
import { useState } from "react"

export default function Login(){
    const[username,setUsername] = useState('');
    const[password,setPassword] = useState('');
    return(
        <div className="flex-1 bg-base-black-0 flex flex-row justify-center items-center">

            <div className="px-2 py-4 bg-base-black-1 flex flex-col gap-2 w-1/4">
                <div>Login</div>
                <input type="text" name="" id="" className="w-full py-2 px-2 text-white" onChange={(e) => {setUsername(e.target.value)}}/>
                <input type="text" name="" id="" className="w-full py-2 px-2 text-white" onChange={(e) => {setPassword(e.target.value)}}/>
                <button className="w-full bg-dark-tile py-2 rounded-lg" onClick={()=> {
                    console.log(username,password)
                    signIn('credentials' , {callbackUrl : '/play/online',username : username,password : password});
                }}>login</button>
                <button onClick={() => {
                    signOut({callbackUrl : "/auth/login"})
                }}>Logout</button>
            </div>
        </div>
    )
}